#include "MySql.h"
#include "Hooks.h"
#include "TribeScore.h"

#include <API/ARK/Ark.h>
#include <fstream>
#include <vector>

#pragma comment(lib, "ArkApi.lib")


// Vectors
std::vector<std::string> disabledtribescore;


// Show tribescore command
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
    }
    else {
        MySql::AddDisableTribescore(id);
        disabledtribescore.push_back(id);
        ArkApi::GetApiUtils().SendChatMessage(player_controller, "SHOW TRIBESCORE", "DISABLED");
    }
}


// Read config
void ReadConfig() {
    const std::string path = ArkApi::Tools::GetCurrentDir() + "/ArkApi/Plugins/TribeScore/config.json";
    std::ifstream file{ path };
    if (!file.is_open()) {
        throw std::runtime_error("Failed to open (Plugins/TribeScore/config.json)");
    }

    file >> TribeScore::config;
    file.close();
}


// Load plugin
void Load() {
    Log::Get().Init("TribeScore");

    // Load config
    try {
        ReadConfig();
    } catch (const std::exception& error) {
        Log::GetLog()->error(error.what());
        throw;
    }

    // Load database
    try {
        const auto& mysqlCredentials = TribeScore::config["MySql"];
        TribeScore::database = std::make_unique<MySql>(
            mysqlCredentials.value("hostWithPort", ""),
            mysqlCredentials.value("username", ""),
            mysqlCredentials.value("password", ""),
            mysqlCredentials.value("schema", ""));
    } catch (const std::exception& error) {
        Log::GetLog()->error(error.what());
        throw;
    }


    // Load hooks
    TribeScore::Hooks::Load();

    // Add commands
    ArkApi::GetCommands().AddChatCommand("/ts", &tribescoreenabled);
}


// Unload plugin
void Unload() {
    // Unload hooks
    TribeScore::Hooks::Unload();

    // Remove commands
    ArkApi::GetCommands().RemoveChatCommand("/ts");
}


BOOL APIENTRY DllMain(HMODULE hModule, DWORD ul_reason_for_call, LPVOID lpReserved) {
    switch (ul_reason_for_call) {
    case DLL_PROCESS_ATTACH:
        Load();
        break;
    case DLL_PROCESS_DETACH:
        Unload();
        break;
    }
    return TRUE;
}
