#include "MySql.h"
#include "TribeScore.h"

#include <API/ARK/Ark.h>
#include <fstream>

#pragma comment(lib, "ArkApi.lib")

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
            mysqlCredentials.value("pasword", ""),
            mysqlCredentials.value("schema", "")
        );
    } catch (const std::exception& error) {
        Log::GetLog()->error(error.what());
        throw;
    }


    // Set hooks 
}


// Unload plugin
void Unload() {}


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

