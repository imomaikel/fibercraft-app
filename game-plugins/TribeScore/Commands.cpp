#include "Commands.h"
#include "TribeScore.h"


std::vector<std::string> floatingTextDisabledSteamIds;
std::vector<std::string> tribeScoreDisabledSteamIds;

namespace TribeScore::Commands {

    void DisableAdminTribeScore(AShooterPlayerController* playerController, FString* message, bool /*unused*/) {
        try {
            auto configuration = TribeScore::config["Config"];
            auto adminSteamIds = configuration["AdminIDS"];

            uint64 playerSteamId = ArkApi::GetApiUtils().GetSteamIdFromController(playerController);
            std::string textSteamId = std::to_string(playerSteamId);

            bool found = false;
            if (adminSteamIds != "") {
                for (const auto& id : adminSteamIds) {
                    if (id == textSteamId) {
                        found = true;
                        break;
                    }
                }
            }

            if (found == false) {
                ArkApi::GetApiUtils().SendChatMessage(playerController, "DISABLE TRIBESCORE" , "You are NOT allowed to use this command!");
                return;
            }

            auto it = std::find(tribeScoreDisabledSteamIds.begin(), tribeScoreDisabledSteamIds.end(), textSteamId);
            const bool isDisabled = it != tribeScoreDisabledSteamIds.end();

            ArkApi::GetApiUtils().SendChatMessage(playerController, "Getting Tribescore is ", isDisabled ? "ENABLED" : "DISABLED");

            if (isDisabled) {
                tribeScoreDisabledSteamIds.erase(it);
                TribeScore::database->EnableAdminTribeScore(textSteamId);
            } else {
                tribeScoreDisabledSteamIds.push_back(textSteamId);
                TribeScore::database->DisableAdminTribeScore(textSteamId);
            }

        } catch (std::exception& error) {
            Log::GetLog()->critical("Anrror ocurred in DisableAdminTribeScore function! {}", error.what());
        }   
    }

    void ToggleFloatingText(AShooterPlayerController* playerController, FString* message, bool /*unused*/) {
        uint64 steamId = ArkApi::GetApiUtils().GetSteamIdFromController(playerController);
        
        std::string textSteamId = std::to_string(steamId);

        auto it = std::find(floatingTextDisabledSteamIds.begin(), floatingTextDisabledSteamIds.end(), textSteamId);

        const bool isDisabled = it != floatingTextDisabledSteamIds.end();

        ArkApi::GetApiUtils().SendChatMessage(playerController, "Floating Tribe Score", isDisabled ? "ENABLED" : "DISABLED");

        if (isDisabled) {
            floatingTextDisabledSteamIds.erase(it);
            TribeScore::database->EnableFloatingText(textSteamId);
        } else {
            floatingTextDisabledSteamIds.push_back(textSteamId);
            TribeScore::database->DisableFloatingText(textSteamId);
        }
    }

    void DisablePlayerFloatingTextOnLogin(std::string steamId) {
        floatingTextDisabledSteamIds.push_back(steamId);
    }

    void DisableAdminTribeScoreOnLogin(std::string steamId) {
        tribeScoreDisabledSteamIds.push_back(steamId);
    }

    void ErasePlayerSteamIdOnLogout(std::string steamId) {
        floatingTextDisabledSteamIds.erase(std::remove(floatingTextDisabledSteamIds.begin(), floatingTextDisabledSteamIds.end(), steamId), floatingTextDisabledSteamIds.end());
    }

    void EraseAdminSteamIdOnLogout(std::string steamId) {
        tribeScoreDisabledSteamIds.erase(std::remove(tribeScoreDisabledSteamIds.begin(), tribeScoreDisabledSteamIds.end(), steamId), tribeScoreDisabledSteamIds.end());
    }

    bool IsPlayerFloatingScoreEnabled(std::string steamId) {
        auto it = std::find(floatingTextDisabledSteamIds.begin(), floatingTextDisabledSteamIds.end(), steamId);
        const bool isDisabled = it != floatingTextDisabledSteamIds.end();

        return isDisabled;
    }

    bool IsAdminTribeScoreEnabled(std::string steamId) {
        auto it = std::find(tribeScoreDisabledSteamIds.begin(), tribeScoreDisabledSteamIds.end(), steamId);
        const bool isDisabled = it != tribeScoreDisabledSteamIds.end();

        return isDisabled;
    }

	void Unload() {
		ArkApi::GetCommands().RemoveChatCommand("/ts");
        ArkApi::GetCommands().RemoveChatCommand("/dta");
    }
	
	void Load() {
        ArkApi::GetCommands().AddChatCommand("/ts", &ToggleFloatingText);
        ArkApi::GetCommands().AddChatCommand("/dta", &DisableAdminTribeScore);
	}
}