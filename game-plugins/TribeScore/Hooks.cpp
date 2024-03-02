#include "Hooks.h"
#include "Commands.h"
#include "TribeScore.h"


namespace TribeScore::Hooks {

    // Declare hooks
    DECLARE_HOOK(AShooterGameMode_Logout, void, AShooterGameMode*, AController*);
    DECLARE_HOOK(APrimalStructure_Die, bool, APrimalStructure*, float, FDamageEvent*, AController*, AActor*);
    DECLARE_HOOK(AShooterGameMode_StartNewShooterPlayer, void, AShooterGameMode*, APlayerController*, bool, bool, FPrimalPlayerCharacterConfigStruct*, UPrimalPlayerData*);


    // Login Hook
    void Hook_AShooterGameMode_StartNewShooterPlayer(AShooterGameMode* game, APlayerController* playerController, bool forceCreateNewPlayerData, bool isFromLogin, FPrimalPlayerCharacterConfigStruct* config, UPrimalPlayerData* data) {
        AShooterGameMode_StartNewShooterPlayer_original(game, playerController, forceCreateNewPlayerData, isFromLogin, config, data);

        if (isFromLogin) {
            AShooterPlayerController* shooterPlayerController = static_cast<AShooterPlayerController*>(playerController);
            uint64 steamID = ArkApi::GetApiUtils().GetSteamIdFromController(playerController);
            std::string textSteamId = std::to_string(steamID);

            bool isDisabled = TribeScore::database -> DisabledTribescore(textSteamId);
            if (isDisabled == true) {
                TribeScore::Commands::DisableOnLogin(textSteamId);
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
        }
    }


    // Structure die Hook
    bool Hook_APrimalStructure_Die(APrimalStructure* _this, float damage, FDamageEvent* damageEvent, AController* controller, AActor* actor) {
        APrimalStructure_Die_original(_this, damage, damageEvent, controller, actor);

        if (_this == nullptr || actor == nullptr || !actor->IsA(AActor::GetPrivateStaticClass())) return APrimalStructure_Die_original;
        
        const FString destroyedStructureName = _this->DescriptiveNameField();
        const int destroyedTribeId = _this->TargetingTeamField();

        auto attackerTribeId = actor->TargetingTeamField();
        auto attackerId = actor->TargetingTeamField();

        // Destroyed own structure
        if (destroyedTribeId == attackerTribeId) return APrimalStructure_Die_original;

        /// Unclaimed dinos
        if (attackerId == 2000000000) return APrimalStructure_Die_original;
            
        // Untamed dinos
        if (attackerId < 100) return APrimalStructure_Die_original;


        // TODO BEGIN
        int score = GetStructureTribescore(name.ToString());

        std::string attacker = std::to_string(attacker_id);
        std::string defender = std::to_string(id);
        bool IsInDatabase = MySql::IsAlreadyInDatabase(attacker);
        if (IsInDatabase) {
            int score_amount = MySql::tribescore_amount(attacker) + score;
            std::string score = std::to_string(score_amount);
            MySql::UpdateTribescore(attacker, score);
        } else {
            std::string score = std::to_string(1);
            MySql::AddTribescore(attacker, score);
        }

        bool IsDefenderInDatabase = MySql::IsAlreadyInDatabase(defender);
        if (IsDefenderInDatabase) {
            int score_amount = MySql::tribescore_amount(defender) - score;
            std::string score = std::to_string(score_amount);
            MySql::UpdateTribescore(defender, score);
        } else {
            std::string score = std::to_string(-1);
            MySql::AddTribescore(defender, score);
        }

        const auto& actorsInRange = ArkApi::GetApiUtils().GetAllActorsInRange(_this->RootComponentField()->RelativeLocationField(), 20000.0f, EServerOctreeGroup::PLAYERS_CONNECTED);
        for (AActor* actorInRange : actorsInRange) {
            if (actorInRange != nullptr && actorInRange->IsA(AActor::GetPrivateStaticClass())) {
                if (actorInRange->IsA(APrimalStructure::GetPrivateStaticClass())) {
                    return APrimalStructure_Die_original(_this, damage, damageEvent, controller, actorInRange);
                }
                const auto aController = actorInRange->GetInstigatorController();
                AShooterPlayerController* PlayerController = reinterpret_cast<AShooterPlayerController*>(aController);
                std::string numbertext = std::to_string(score);
                FString text = FString("Tribescore +" + numbertext);

                uint64 steamId = ArkApi::GetApiUtils().GetSteamIdFromController(PlayerController);
                bool found = false;
                std::string converted = std::to_string(steamId);
                for (std::string content : disabledtribescore) {
                    if (content == converted) {
                        found = true;
                        break;
                    }
                }

                if (found == true) {
                    return APrimalStructure_Die_original(_this, damage, damageEvent, controller, actor);
                }

                if (PlayerController == nullptr) {

                } else {
                    if (actor->TargetingTeamField() == _this->TargetingTeamField()) {
                        PlayerController->ClientAddFloatingText(_this->RootComponentField()->RelativeLocationField(), &text, FColor(255, 0, 0, 255), 0.2, 0.2, 4, FVector(0.2, 0.2, 0.2), 1, 0.5, 0.5);
                    } else if (actor->TargetingTeamField() == attacker_id) {
                        PlayerController->ClientAddFloatingText(_this->RootComponentField()->RelativeLocationField(), &text, FColor(0, 255, 0, 255), 0.2, 0.2, 4, FVector(0.2, 0.2, 0.2), 1, 0.5, 0.5);

                    } else {
                        PlayerController->ClientAddFloatingText(_this->RootComponentField()->RelativeLocationField(), &text, FColor(255, 177, 0, 255), 0.2, 0.2, 4, FVector(0.2, 0.2, 0.2), 1, 0.5, 0.5);
                    }
                }
            } else {
            }
        }
        // TODO END

        return APrimalStructure_Die_original;
    }


    void Load() {
        ArkApi::GetHooks().SetHook("APrimalStructure.Die", &Hook_APrimalStructure_Die, &APrimalStructure_Die_original);
        ArkApi::GetHooks().SetHook("AShooterGameMode.Logout", &Hook_AShooterGameMode_Logout, &AShooterGameMode_Logout_original);
        ArkApi::GetHooks().SetHook("AShooterGameMode.StartNewShooterPlayer", &Hook_AShooterGameMode_StartNewShooterPlayer, &AShooterGameMode_StartNewShooterPlayer_original);
    }

    void Unload() {
        ArkApi::GetHooks().DisableHook("APrimalStructure.Die", &Hook_APrimalStructure_Die);
        ArkApi::GetHooks().DisableHook("AShooterGameMode.Logout", &Hook_AShooterGameMode_Logout);
        ArkApi::GetHooks().DisableHook("AShooterGameMode.StartNewShooterPlayer", &Hook_AShooterGameMode_StartNewShooterPlayer);
    }
}