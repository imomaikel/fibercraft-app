#include "Commands.h"
#include "TribeScore.h"


std::vector<std::string> disabledtribescore;

namespace TribeScore::Commands {


	
    void tribescoreenabled(AShooterPlayerController* player_controller, FString* message, bool /*unused*/) {
        uint64 steam_id = ArkApi::GetApiUtils().GetSteamIdFromController(player_controller);
        std::string id = std::to_string(steam_id);

        bool found = false;
        int index = 0;
        for (const auto& cadena : disabledtribescore) {
            if (cadena == id) {
                found = true;
                break;
            }
            index += 1;
        }

        if (found) {
            disabledtribescore.erase(disabledtribescore.begin() + index);
            MySql::DeleteFromDisabledTribescoreDatabase(id);
            ArkApi::GetApiUtils().SendChatMessage(player_controller, "SHOW TRIBESCORE", "ENABLED");
        } else {
            MySql::AddDisableTribescore(id);
            disabledtribescore.push_back(id);
            ArkApi::GetApiUtils().SendChatMessage(player_controller, "SHOW TRIBESCORE", "DISABLED");
        }
    }


	void Unload() {
		ArkApi::GetCommands().RemoveChatCommand("/ts");
	}
	
	void Load() {
		ArkApi::GetCommands().AddChatCommand("/ts", &tribescoreenabled);
	}
}