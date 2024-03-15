#include "Hooks.h"
#include "Commands.h"
#include "Utils.h"
#include "TribeScore.h"


namespace TribeScore::Hooks {

    // Declare hooks
    DECLARE_HOOK(AShooterGameMode_Logout, void, AShooterGameMode*, AController*);
    DECLARE_HOOK(APrimalStructure_Die, bool, APrimalStructure*, float, FDamageEvent*, AController*, AActor*);
    DECLARE_HOOK(AShooterGameMode_StartNewShooterPlayer, void, AShooterGameMode*, APlayerController*, bool, bool, FPrimalPlayerCharacterConfigStruct*, UPrimalPlayerData*);
    DECLARE_HOOK(AShooterCharacter_Die, bool, AShooterCharacter*, float, FDamageEvent*, AController*, AActor*);
    DECLARE_HOOK(AShooterCharacter_ChangeActorTeam, void, AShooterCharacter*, int);

    // Player login hook
    void Hook_AShooterGameMode_StartNewShooterPlayer(AShooterGameMode* game, APlayerController* playerController, bool forceCreateNewPlayerData, bool isFromLogin, FPrimalPlayerCharacterConfigStruct* config, UPrimalPlayerData* data) {
        
        AShooterGameMode_StartNewShooterPlayer_original(game, playerController, forceCreateNewPlayerData, isFromLogin, config, data);
        if (isFromLogin) {
            AShooterPlayerController* shooterPlayerController = static_cast<AShooterPlayerController*>(playerController);
            uint64 steamID = ArkApi::GetApiUtils().GetSteamIdFromController(playerController);
            std::string textSteamId = std::to_string(steamID);

            const int playerTribeId = shooterPlayerController->TargetingTeamField();
            TribeScore::database->CreateTribeData(playerTribeId);

            bool isDisabled = TribeScore::database -> IsPlayerFloatingTextDisabled(textSteamId);
            bool IsAdminDisabled = TribeScore::database->IsAdminTribeScoreDisabled(textSteamId);
            if (isDisabled == true) {
                TribeScore::Commands::DisablePlayerFloatingTextOnLogin(textSteamId);
            }
            if (IsAdminDisabled == true) {
                TribeScore::Commands::DisableAdminTribeScoreOnLogin(textSteamId);
            }
        }
    }

    // Player logout hook
    void Hook_AShooterGameMode_Logout(AShooterGameMode* mode, AController* controller) {
        AShooterGameMode_Logout_original(mode, controller);

        if (controller) {
            AShooterPlayerController* player = static_cast<AShooterPlayerController*>(controller);
            uint64 steamID = ArkApi::GetApiUtils().GetSteamIdFromController(player);
            std::string textSteamId = std::to_string(steamID);
            TribeScore::Commands::ErasePlayerSteamIdOnLogout(textSteamId);
            TribeScore::Commands::EraseAdminSteamIdOnLogout(textSteamId);
        }
    }

    // Kill player hook
    bool Hook_AShooterCharacter_Die(AShooterCharacter* _this, float KillingDamage, FDamageEvent* DamageEvent, AController* Killer, AActor* DamageCauser) {
        AShooterCharacter_Die_original(_this, KillingDamage, DamageEvent, Killer, DamageCauser);
        if (Killer && !Killer->IsLocalController() && Killer->IsA(AShooterPlayerController::GetPrivateStaticClass()) && _this->TargetingTeamField() != Killer->TargetingTeamField() && _this->GetPlayerData()) {
            const int attackerId = DamageCauser->TargetingTeamField();
            const int defenderId = _this->TargetingTeamField();

            bool allied = TribeScore::Utils::isAlliance(defenderId, attackerId);
            if (allied == true) return AShooterCharacter_Die_original;

            std::string attackerIdText = std::to_string(attackerId);
            std::string defenderIdText = std::to_string(defenderId);

            TribeScore::database->UpdateTribeScore(attackerIdText, defenderIdText, "50");

            const auto& actorsInRange = ArkApi::GetApiUtils().GetAllActorsInRange(_this->RootComponentField()->RelativeLocationField(), 20000.0f, EServerOctreeGroup::PLAYERS_CONNECTED);
            
            for (AActor* actorInRange : actorsInRange) {
                const auto aController = actorInRange->GetInstigatorController();
                AShooterPlayerController* playerController = reinterpret_cast<AShooterPlayerController*>(aController);
                
                FString floatingText;

                const std::string textPoints = std::to_string(50);
                if (actorInRange->TargetingTeamField() == defenderId) {
                    FString floatingText = FString(fmt::format("+ {} tribe score", textPoints));
                } else if (actorInRange->TargetingTeamField() == attackerId) {
                    FString floatingText = FString(fmt::format("- {} tribe score", textPoints));
                } else {
                    FString floatingText = FString(fmt::format("+ {} tribe score", textPoints));
                }

                uint64 attackerSteamId = ArkApi::GetApiUtils().GetSteamIdFromController(playerController);
                std::string textSteamId = std::to_string(attackerSteamId);

                const bool isFloatingTextDisabled = Commands::IsPlayerFloatingScoreEnabled(textSteamId);
                if (isFloatingTextDisabled) continue;

                if (!playerController) return AShooterCharacter_Die_original;

                if (actorInRange->TargetingTeamField() == defenderId) {
                    playerController->ClientAddFloatingText(_this->RootComponentField()->RelativeLocationField(), &floatingText, FColor(255, 0, 0, 255), 0.6, 0.6, 6, FVector(0.2, 0.2, 0.2), 1, 0.5, 0.5);
                } else if (actorInRange->TargetingTeamField() == attackerId) {
                    playerController->ClientAddFloatingText(_this->RootComponentField()->RelativeLocationField(), &floatingText, FColor(0, 255, 0, 255), 0.6, 0.6, 6, FVector(0.2, 0.2, 0.2), 1, 0.5, 0.5);
                } else {
                    playerController->ClientAddFloatingText(_this->RootComponentField()->RelativeLocationField(), &floatingText, FColor(255, 177, 0, 255), 0.6, 0.6, 6, FVector(0.2, 0.2, 0.2), 1, 0.5, 0.5);
                }
            }

        }
        return AShooterCharacter_Die_original;
    }

    // Structure die hook
    bool Hook_APrimalStructure_Die(APrimalStructure* _this, float damage, FDamageEvent* damageEvent, AController* controller, AActor* actor) {
        APrimalStructure_Die_original(_this, damage, damageEvent, controller, actor);
        
        if (_this == nullptr || actor == nullptr || !actor->IsA(AActor::GetPrivateStaticClass())) return APrimalStructure_Die_original;
        
        const std::string destroyedStructureName = _this->DescriptiveNameField().ToString();
        const int destroyedTribeId = _this->TargetingTeamField();

        auto attackerTribeId = actor->TargetingTeamField();
        auto attackerId = actor->TargetingTeamField();

        // Destroyed own structure        
        if (destroyedTribeId == attackerTribeId) return APrimalStructure_Die_original;

        /// Unclaimed dinos
        if (attackerId == 2000000000) return APrimalStructure_Die_original;
            
        // Untamed dinos
        if (attackerId < 100) return APrimalStructure_Die_original;

        // Vault bug giving you tribescore fix
        if ( _this->ReplicatedHealthField() > 0) return APrimalStructure_Die_original;

        // Get points for the structure
        int score = TribeScore::Utils::GetStructurePoints(destroyedStructureName);
        if (score == 0) return APrimalStructure_Die_original;

        bool IsAlly = TribeScore::Utils::isAlliance(destroyedTribeId, attackerTribeId);
        if (IsAlly) return APrimalStructure_Die_original;

        std::string attacker = std::to_string(attackerId);
        std::string defender = std::to_string(destroyedTribeId);

        const auto aController = actor->GetInstigatorController();
        AShooterPlayerController* playerController = reinterpret_cast<AShooterPlayerController*>(aController);
        uint64 steamId = ArkApi::GetApiUtils().GetSteamIdFromController(playerController);
        std::string textSteamId = std::to_string(steamId);

        const bool Adminfound = Commands::IsAdminTribeScoreEnabled(textSteamId);
        if (Adminfound) return APrimalStructure_Die_original;

        TribeScore::database->UpdateTribeScore(attacker, defender, std::to_string(score));
        
        const auto& actorsInRange = ArkApi::GetApiUtils().GetAllActorsInRange(_this->RootComponentField()->RelativeLocationField(), 20000.0f, EServerOctreeGroup::PLAYERS_CONNECTED);

        for (AActor* actorInRange : actorsInRange) {
            if (actorInRange != nullptr && actorInRange->IsA(AActor::GetPrivateStaticClass())) {
                if (actor->IsA(APrimalStructure::GetPrivateStaticClass())) {
                    APrimalStructure* structure = reinterpret_cast<APrimalStructure*>(actor);
                    try {
                        std::string structureName = structure->DescriptiveNameField().ToString();
                        if (structureName != "C4 Charge" and structureName != "Eggsplosive Basket") {
                            std::string defenderTribeName = TribeScore::Utils::getTribeName(_this->TargetingTeamField());
                            std::string attackerTribeName = TribeScore::Utils::getTribeName(structure->TargetingTeamField());
                            FString result;
                            auto map_name = ArkApi::GetApiUtils().GetShooterGameMode()->GetMapName(&result);
                            std::string message = fmt::format(
                                "MAP NAME: {} Structure Location: {} Tribe ID: {} Tribe Name: {} Got destroyed by: {} Tribe ID: {} Tribe Name: {}",
                                map_name->ToString(),
                                _this->RootComponentField()->RelativeLocationField().ToString().ToString(),
                                _this->TargetingTeamField(),
                                defenderTribeName,
                                structureName,
                                structure->TargetingTeamField(),
                                attackerTribeName
                            );
                            TribeScore::Utils::sendWebhookMessage(message);
                        }
                    } catch (std::exception& error) {
                        Log::GetLog()->critical("Error in turret raiding detection!: {}", error.what());
                    }
                    
                }

                const auto aController = actorInRange->GetInstigatorController();
                AShooterPlayerController* playerController = reinterpret_cast<AShooterPlayerController*>(aController);

                FString floatingText;

                const std::string textPoints = std::to_string(score);
                if (actorInRange->TargetingTeamField() == _this->TargetingTeamField()) {
                    floatingText = FString(fmt::format("- {} tribe score", textPoints));
                } else if (actorInRange->TargetingTeamField() == attackerId) {
                    floatingText = FString(fmt::format("+ {} tribe score", textPoints));
                } else {
                    floatingText = FString(fmt::format("+ {} tribe score", textPoints));
                }

                
                uint64 steamId = ArkApi::GetApiUtils().GetSteamIdFromController(playerController);
                std::string textSteamId = std::to_string(steamId);

                const bool isFloatingTextDisabled = Commands::IsPlayerFloatingScoreEnabled(textSteamId);
                if (isFloatingTextDisabled) continue;

                if (!playerController) return APrimalStructure_Die_original;

                if (actorInRange->TargetingTeamField() == _this->TargetingTeamField()) {
                    playerController->ClientAddFloatingText(_this->RootComponentField()->RelativeLocationField(), &floatingText, FColor(255, 0, 0, 255), 0.4, 0.4, 4, FVector(0.2, 0.2, 0.2), 1, 0.5, 0.5);
                } else if (actorInRange->TargetingTeamField() == attackerId) {
                    playerController->ClientAddFloatingText(_this->RootComponentField()->RelativeLocationField(), &floatingText, FColor(0, 255, 0, 255), 0.4, 0.4, 4, FVector(0.2, 0.2, 0.2), 1, 0.5, 0.5);
                } else {
                    playerController->ClientAddFloatingText(_this->RootComponentField()->RelativeLocationField(), &floatingText, FColor(255, 177, 0, 255), 0.4, 0.4, 4, FVector(0.2, 0.2, 0.2), 1, 0.5, 0.5);
                }
            }
        }
        return APrimalStructure_Die_original;
    }

    // Change tribe hook
    void Hook_AShooterCharacter_ChangeActorTeam(AShooterCharacter* _this, int NewTeam) {
        if (NewTeam != 0) {
            const auto tribeName = TribeScore::Utils::getTribeName(NewTeam);

            TribeScore::database->CreateTribeData(NewTeam);
            TribeScore::database->UpdateTribeName(NewTeam);
        }

        return AShooterCharacter_ChangeActorTeam_original(_this, NewTeam);
    }


    void Load() {
        ArkApi::GetHooks().SetHook("APrimalStructure.Die", &Hook_APrimalStructure_Die, &APrimalStructure_Die_original);
        ArkApi::GetHooks().SetHook("AShooterCharacter.Die", &Hook_AShooterCharacter_Die,&AShooterCharacter_Die_original);
        ArkApi::GetHooks().SetHook("AShooterGameMode.Logout", &Hook_AShooterGameMode_Logout, &AShooterGameMode_Logout_original);
        ArkApi::GetHooks().SetHook("AShooterCharacter.ChangeActorTeam", &Hook_AShooterCharacter_ChangeActorTeam, &AShooterCharacter_ChangeActorTeam_original);
        ArkApi::GetHooks().SetHook("AShooterGameMode.StartNewShooterPlayer", &Hook_AShooterGameMode_StartNewShooterPlayer, &AShooterGameMode_StartNewShooterPlayer_original);
    }

    void Unload() {
        ArkApi::GetHooks().DisableHook("APrimalStructure.Die", &Hook_APrimalStructure_Die);
        ArkApi::GetHooks().DisableHook("AShooterCharacter.Die", &Hook_AShooterCharacter_Die);
        ArkApi::GetHooks().DisableHook("AShooterGameMode.Logout", &Hook_AShooterGameMode_Logout);
        ArkApi::GetHooks().DisableHook("AShooterCharacter.ChangeActorTeam", &Hook_AShooterCharacter_ChangeActorTeam);
        ArkApi::GetHooks().DisableHook("AShooterGameMode.StartNewShooterPlayer", &Hook_AShooterGameMode_StartNewShooterPlayer);
    }
}