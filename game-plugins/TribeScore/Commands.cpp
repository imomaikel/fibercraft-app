#include "Commands.h"
#include "TribeScore.h"


std::vector<std::string> disabledSteamIds;
std::vector<std::string> disabledAdminsSteamIds;
namespace TribeScore::Commands {

    void DisableTribescoreAdmin(AShooterPlayerController* playerController, FString* message, bool /*unused*/) {
        try {
            uint64 steamId = ArkApi::GetApiUtils().GetSteamIdFromController(playerController);

            std::string textSteamId = std::to_string(steamId);

            auto it = std::find(disabledAdminsSteamIds.begin(), disabledAdminsSteamIds.end(), textSteamId);

            const bool isDisabled = it != disabledSteamIds.end();

            ArkApi::GetApiUtils().SendChatMessage(playerController, "Floating Tribe Score", isDisabled ? "ENABLED" : "DISABLED");

            if (isDisabled) {
                disabledAdminsSteamIds.erase(it);

            }

        } catch (std::exception& error) {
            Log::GetLog()->critical("error ocurred in DisableTribescoreAdmin function!, error:{}",error.what());
        }   
    }

    void ToggleTribeScore(AShooterPlayerController* playerController, FString* message, bool /*unused*/) {
        uint64 steamId = ArkApi::GetApiUtils().GetSteamIdFromController(playerController);
        
        std::string textSteamId = std::to_string(steamId);

        auto it = std::find(disabledSteamIds.begin(), disabledSteamIds.end(), textSteamId);

        const bool isDisabled = it != disabledSteamIds.end();

        ArkApi::GetApiUtils().SendChatMessage(playerController, "Floating Tribe Score", isDisabled ? "ENABLED" : "DISABLED");

        if (isDisabled) {
            disabledSteamIds.erase(it);
            TribeScore::database->EnableSteamId(textSteamId);
        } else {
            disabledSteamIds.push_back(textSteamId);
            TribeScore::database->DisableSteamId(textSteamId);
        }
    }

    void DisableOnLogin(std::string steamId) {
        disabledSteamIds.push_back(steamId);
    }

    void AdminDisableOnLogin(std::string steamId) {
        disabledAdminsSteamIds.push_back(steamId);
    }

    void EraseOnLogout(std::string steamId) {
        disabledSteamIds.erase(std::remove(disabledSteamIds.begin(), disabledSteamIds.end(), steamId), disabledSteamIds.end());
    }

    void AdminEraseOnLogout(std::string steamId) {
        disabledAdminsSteamIds.erase(std::remove(disabledSteamIds.begin(), disabledSteamIds.end(), steamId), disabledSteamIds.end());
    }

    bool isSteamDisabled(std::string steamId) {
        auto it = std::find(disabledSteamIds.begin(), disabledSteamIds.end(), steamId);
        const bool isDisabled = it != disabledSteamIds.end();
        return isDisabled;
    }

	void Unload() {
		ArkApi::GetCommands().RemoveChatCommand("/ts");
        ArkApi::GetCommands().RemoveChatCommand("/dta");
    }
	
	void Load() {
        ArkApi::GetCommands().AddChatCommand("/ts", &ToggleTribeScore);
        ArkApi::GetCommands().AddChatCommand("/dta", &DisableTribescoreAdmin);
	}
}