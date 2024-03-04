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

    // Login Hook
    void Hook_AShooterGameMode_StartNewShooterPlayer(AShooterGameMode* game, APlayerController* playerController, bool forceCreateNewPlayerData, bool isFromLogin, FPrimalPlayerCharacterConfigStruct* config, UPrimalPlayerData* data) {
        AShooterGameMode_StartNewShooterPlayer_original(game, playerController, forceCreateNewPlayerData, isFromLogin, config, data);

        if (isFromLogin) {
            AShooterPlayerController* shooterPlayerController = static_cast<AShooterPlayerController*>(playerController);
            uint64 steamID = ArkApi::GetApiUtils().GetSteamIdFromController(playerController);
            std::string textSteamId = std::to_string(steamID);

            const int playerTribeId = shooterPlayerController->TargetingTeamField();
            TribeScore::database->CreateTribeData(playerTribeId);

            bool isDisabled = TribeScore::database -> CheckIfSteamIdIsDisabled(textSteamId);
            bool IsAdminDisabled = TribeScore::database->CheckIfAdminDisabled(textSteamId);
            if (isDisabled == true) {
                TribeScore::Commands::DisableOnLogin(textSteamId);
            }
            if (IsAdminDisabled == true) {
                TribeScore::Commands::AdminDisableOnLogin(textSteamId);
            }
        }
    }


    // Logout Hook
    void Hook_AShooterGameMode_Logout(AShooterGameMode* mode, AController* controller) {
        AShooterGameMode_Logout_original(mode, controller);
        if (controller) {
            AShooterPlayerController* player = static_cast<AShooterPlayerController*>(controller);
            uint64 steamID = ArkApi::GetApiUtils().GetSteamIdFromController(player);
            std::string textSteamId = std::to_string(steamID);
            TribeScore::Commands::EraseOnLogout(textSteamId);
            TribeScore::Commands::AdminEraseOnLogout(textSteamId);
        }
    }

    // Kill Player Hook
    bool Hook_AShooterCharacter_Die(AShooterCharacter* _this, float KillingDamage, FDamageEvent* DamageEvent, AController* Killer, AActor* DamageCauser) {
        
        if (Killer && !Killer->IsLocalController() && Killer->IsA(AShooterPlayerController::GetPrivateStaticClass()) && _this->TargetingTeamField() != Killer->TargetingTeamField() && _this->GetPlayerData()) {
            const int AttackerId = DamageCauser->TargetingTeamField();
            const int DefenderId = _this->TargetingTeamField();

            std::string attacker = std::to_string(AttackerId);
            std::string defender = std::to_string(DefenderId);

            TribeScore::database->UpdateTribeScore(attacker, defender, std::to_string(50));
            const auto& actorsInRange = ArkApi::GetApiUtils().GetAllActorsInRange(_this->RootComponentField()->RelativeLocationField(), 20000.0f, EServerOctreeGroup::PLAYERS_CONNECTED);
            for (AActor* actorInRange : actorsInRange) {
                const auto aController = actorInRange->GetInstigatorController();
                AShooterPlayerController* playerController = reinterpret_cast<AShooterPlayerController*>(aController);
                
                FString floatingText;

                const std::string textPoints = std::to_string(50);
                if (actorInRange->TargetingTeamField() == DefenderId) {
                    FString floatingText = FString("+ " + textPoints + " tribe score");
                } else if (actorInRange->TargetingTeamField() == AttackerId) {
                    FString floatingText = FString("- " + textPoints + " tribe score");
                } else {
                    FString floatingText = FString("+ " + textPoints + " tribe score");
                }

                uint64 steamId = ArkApi::GetApiUtils().GetSteamIdFromController(playerController);
                std::string textSteamId = std::to_string(steamId);
                const bool found = Commands::isSteamDisabled(textSteamId);


                if (!playerController) return AShooterCharacter_Die_original(_this, KillingDamage, DamageEvent, Killer, DamageCauser);
                if (found == true) return AShooterCharacter_Die_original(_this, KillingDamage, DamageEvent, Killer, DamageCauser);

                if (actorInRange->TargetingTeamField() == DefenderId) {
                    playerController->ClientAddFloatingText(_this->RootComponentField()->RelativeLocationField(), &floatingText, FColor(255, 0, 0, 255), 0.6, 0.6, 6, FVector(0.2, 0.2, 0.2), 1, 0.5, 0.5);
                } else if (actorInRange->TargetingTeamField() == AttackerId) {
                    playerController->ClientAddFloatingText(_this->RootComponentField()->RelativeLocationField(), &floatingText, FColor(0, 255, 0, 255), 0.6, 0.6, 6, FVector(0.2, 0.2, 0.2), 1, 0.5, 0.5);
                } else {
                    playerController->ClientAddFloatingText(_this->RootComponentField()->RelativeLocationField(), &floatingText, FColor(255, 177, 0, 255), 0.6, 0.6, 6, FVector(0.2, 0.2, 0.2), 1, 0.5, 0.5);
                }
            }

        }
        return AShooterCharacter_Die_original(_this, KillingDamage, DamageEvent, Killer, DamageCauser);
    }

    // Structure die Hook
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

        // Get points for the structure
        int score = TribeScore::Utils::GetStructurePoints(destroyedStructureName);
        if (score == 0) return APrimalStructure_Die_original;

       
        std::string attacker = std::to_string(attackerId);
        std::string defender = std::to_string(destroyedTribeId);


        TribeScore::database->UpdateTribeScore(attacker, defender, std::to_string(score));
        
        const auto& actorsInRange = ArkApi::GetApiUtils().GetAllActorsInRange(_this->RootComponentField()->RelativeLocationField(), 20000.0f, EServerOctreeGroup::PLAYERS_CONNECTED);
        for (AActor* actorInRange : actorsInRange) {
            if (actorInRange != nullptr && actorInRange->IsA(AActor::GetPrivateStaticClass())) {
                if (actor->IsA(APrimalStructure::GetPrivateStaticClass())) {
                    APrimalStructure* structure = reinterpret_cast<APrimalStructure*>(actor);

                    std::string structure_name = structure->DescriptiveNameField().ToString();

                    std::cout << "Structure Name: " << _this->DescriptiveNameField().ToString() << " Tribe ID: " << _this->TargetingTeamField() << " Got destroyed by: " << structure_name << " Tribe ID: " << structure->TargetingTeamField() << std::endl;
                }

                const auto aController = actorInRange->GetInstigatorController();
                AShooterPlayerController* playerController = reinterpret_cast<AShooterPlayerController*>(aController);

                FString floatingText;

                const std::string textPoints = std::to_string(score);
                if (actorInRange->TargetingTeamField() == _this->TargetingTeamField()) {
                    floatingText = FString("- " + textPoints + " tribe score");
                } else if (actorInRange->TargetingTeamField() == attackerId) {
                    floatingText = FString("+ " + textPoints + " tribe score");
                } else {
                    floatingText = FString("+ " + textPoints + " tribe score");
                }

                if (floatingText.ToString().length() <= 4) floatingText = FString("? " + textPoints + " tribe score");
                
                uint64 steamId = ArkApi::GetApiUtils().GetSteamIdFromController(playerController);
                std::string textSteamId = std::to_string(steamId);

                const bool found = Commands::isSteamDisabled(textSteamId);
                if (found) continue;

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
        std::cout << std::endl;
        return APrimalStructure_Die_original;
    }


    void Load() {
        ArkApi::GetHooks().SetHook("APrimalStructure.Die", &Hook_APrimalStructure_Die, &APrimalStructure_Die_original);
        ArkApi::GetHooks().SetHook("AShooterGameMode.Logout", &Hook_AShooterGameMode_Logout, &AShooterGameMode_Logout_original);
        ArkApi::GetHooks().SetHook("AShooterGameMode.StartNewShooterPlayer", &Hook_AShooterGameMode_StartNewShooterPlayer, &AShooterGameMode_StartNewShooterPlayer_original);
        ArkApi::GetHooks().SetHook("AShooterCharacter.Die", &Hook_AShooterCharacter_Die,&AShooterCharacter_Die_original);
    }

    void Unload() {
        ArkApi::GetHooks().DisableHook("APrimalStructure.Die", &Hook_APrimalStructure_Die);
        ArkApi::GetHooks().DisableHook("AShooterGameMode.Logout", &Hook_AShooterGameMode_Logout);
        ArkApi::GetHooks().DisableHook("AShooterGameMode.StartNewShooterPlayer", &Hook_AShooterGameMode_StartNewShooterPlayer);
        ArkApi::GetHooks().DisableHook("AShooterCharacter.Die", &Hook_AShooterCharacter_Die);
    }
}