#include "MySql.h"
#include "Hooks.h"
#include "Utils.h"
#include "Commands.h"
#include "TribeScore.h"

#include <API/ARK/Ark.h>
#include <vector>

#pragma comment(lib, "ArkApi.lib")


// Load plugin
void Load() {
    Log::Get().Init("TribeScore");

    // Load config
    TribeScore::Utils::ReadConfig();

    // Load structures
    TribeScore::Utils::ReadStructures();

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

    // Create tables
    TribeScore::database->Setup();

    // Load hooks
    TribeScore::Hooks::Load();

    // Load commands
    TribeScore::Commands::Load();
}


// Unload plugin
void Unload() {
    // Unload hooks
    TribeScore::Hooks::Unload();

    // Remove commands
    TribeScore::Commands::Unload();
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
