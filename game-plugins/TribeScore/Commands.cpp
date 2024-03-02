#include "Commands.h"
#include "TribeScore.h"


std::vector<std::string> disabledSteamIds;

namespace TribeScore::Commands {

    void ToggleTribeScore(AShooterPlayerController* playerController, FString* message, bool /*unused*/) {
        uint64 steamId = ArkApi::GetApiUtils().GetSteamIdFromController(playerController);
        
        std::string textSteamId = std::to_string(steamId);

        auto it = std::find(disabledSteamIds.begin(), disabledSteamIds.end(), textSteamId);

        const bool isDisabled = it != disabledSteamIds.end();

        ArkApi::GetApiUtils().SendChatMessage(playerController, "Floating Tribe Score", isDisabled ? "ENABLED" : "DISABLED");

        if (isDisabled) {
            disabledSteamIds.erase(it);
            TribeScore::database->DeleteFromDisabledTribescoreDatabase(textSteamId);
        } else {
            disabledSteamIds.push_back(textSteamId);
            TribeScore::database->AddDisableTribescore(textSteamId);
        }
    }

    void DisableOnLogin(std::string steamId) {
        disabledSteamIds.push_back(steamId);
    }
    void EraseOnLogout(std::string steamId) {
        disabledSteamIds.erase(std::remove(disabledSteamIds.begin(), disabledSteamIds.end(), steamId), disabledSteamIds.end());
    }


	void Unload() {
		ArkApi::GetCommands().RemoveChatCommand("/ts");
	}
	
	void Load() {
		ArkApi::GetCommands().AddChatCommand("/ts", &ToggleTribeScore);
	}
}