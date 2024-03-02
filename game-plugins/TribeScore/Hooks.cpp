#include "Hooks.h"
#include "TribeScore.h"

namespace TribeScore::Hooks {

    // Hooks
    DECLARE_HOOK(AShooterGameMode_Logout, void, AShooterGameMode*, AController*);
    DECLARE_HOOK(APrimalStructure_Die, bool, APrimalStructure*, float, FDamageEvent*, AController*, AActor*);
    DECLARE_HOOK(AShooterGameMode_StartNewShooterPlayer, void, AShooterGameMode*, APlayerController*, bool, bool, FPrimalPlayerCharacterConfigStruct*, UPrimalPlayerData*);


    // Login Hook
    void AShooterGameMode_StartNewShooterPlayer_Hook(AShooterGameMode* game, APlayerController* controller, bool force_create_new_player_data, bool isfromlogin, FPrimalPlayerCharacterConfigStruct* config, UPrimalPlayerData* data) {
        AShooterGameMode_StartNewShooterPlayer_original(game, controller, force_create_new_player_data, isfromlogin, config, data);

        if (isfromlogin) {
            AShooterPlayerController* player = static_cast<AShooterPlayerController*>(controller);
            uint64 steamID = ArkApi::GetApiUtils().GetSteamIdFromController(player);
            std::string id = std::to_string(steamID);
            bool disabled = Mysql::DisabledTribescore(id);
            if (disabled == true) {
                disabledtribescore.push_back(id);
            }
        }
    }
    // Logout Hook
    void Hook_AShooterGameMode_Logout(AShooterGameMode* mode, AController* controller) {
        if (controller) {
            AShooterPlayerController* player = static_cast<AShooterPlayerController*>(controller);
            uint64 steamID = ArkApi::GetApiUtils().GetSteamIdFromController(player);
            std::string id = std::to_string(steamID);
            std::cout << id << std::endl;
            int index = getIndex(id);
            if (index == 90999430) {

            } else {
                disabledtribescore.erase(disabledtribescore.begin() + index);
            }
        }
        AShooterGameMode_Logout_original(mode, controller);
    }
    // Structure die Hook
    bool Hook_APrimalStructure_Die_(APrimalStructure* _this, float damage, FDamageEvent* eventor, AController* controller, AActor* actor) {

        if (_this == nullptr) {
            return APrimalStructure_Die_original(_this, damage, eventor, controller, actor);
        }
        auto name = _this->DescriptiveNameField();
        auto id = _this->TargetingTeamField();
        if (actor != nullptr && actor->IsA(AActor::GetPrivateStaticClass())) {
            auto attacker_id = actor->TargetingTeamField();
        } else {
            return APrimalStructure_Die_original(_this, damage, eventor, controller, actor);
        }

        if (name.ToString() != "") {
            std::cout << name.ToString() << std::endl;
        }

        auto attacker_id = actor->TargetingTeamField();
        std::string numeroString = std::to_string(attacker_id);
        if (attacker_id == 2000000000) { //unclaimed dinos id
            return APrimalStructure_Die_original(_this, damage, eventor, controller, actor);
        }

        if (numeroString.length() < 3) { //ALL NON TAMED DINOS ARE < 3 TRIBE ID LENGHT
            return APrimalStructure_Die_original(_this, damage, eventor, controller, actor);
        }

        if (id != attacker_id) {
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

            const auto& actors = ArkApi::GetApiUtils().GetAllActorsInRange(_this->RootComponentField()->RelativeLocationField(), 20000.0f, EServerOctreeGroup::PLAYERS_CONNECTED);
            for (AActor* actor : actors) {
                if (actor != nullptr && actor->IsA(AActor::GetPrivateStaticClass())) {
                    if (actor->IsA(APrimalStructure::GetPrivateStaticClass())) {
                        return APrimalStructure_Die_original(_this, damage, eventor, controller, actor);
                    }
                    const auto aController = actor->GetInstigatorController();
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
                        return APrimalStructure_Die_original(_this, damage, eventor, controller, actor);
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
            return APrimalStructure_Die_original(_this, damage, eventor, controller, actor);
        } else {

        }
        return APrimalStructure_Die_original(_this, damage, eventor, controller, actor);
    }


    void Load() {
        ArkApi::GetHooks().SetHook("APrimalStructure.Die", &Hook_APrimalStructure_Die_, &APrimalStructure_Die_original);
        ArkApi::GetHooks().SetHook("AShooterGameMode.Logout", &Hook_AShooterGameMode_Logout, &AShooterGameMode_Logout_original);
        ArkApi::GetHooks().SetHook("AShooterGameMode.StartNewShooterPlayer", &AShooterGameMode_StartNewShooterPlayer_Hook, &AShooterGameMode_StartNewShooterPlayer_original);
    }

    void Unload() {
        ArkApi::GetHooks().DisableHook("APrimalStructure.Die", &Hook_APrimalStructure_Die_);
        ArkApi::GetHooks().DisableHook("AShooterGameMode.Logout", &Hook_AShooterGameMode_Logout);
        ArkApi::GetHooks().DisableHook("AShooterGameMode.StartNewShooterPlayer", &AShooterGameMode_StartNewShooterPlayer_Hook);
    }
}