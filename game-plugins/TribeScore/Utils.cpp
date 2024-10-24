#include "Utils.h"
#include "TribeScore.h"

#include <fstream>


namespace TribeScore::Utils {

    // Read config
    void ReadConfig() {
        try {
            const std::string path = ArkApi::Tools::GetCurrentDir() + "/ArkApi/Plugins/TribeScore/config.json";
            std::ifstream file{ path };
            if (!file.is_open()) {
                throw std::runtime_error("Failed to open (Plugins/TribeScore/config.json)");
            }

            file >> TribeScore::config;
            file.close();
        } catch (const std::exception& error) {
            Log::GetLog()->error(error.what());
            throw;
        }
    }

    // Read structures
    void ReadStructures() {
        try {
            const std::string path = ArkApi::Tools::GetCurrentDir() + "/ArkApi/Plugins/TribeScore/structures.json";
            std::ifstream file{ path };
            if (!file.is_open()) {
                throw std::runtime_error("Failed to open (Plugins/TribeScore/structures.json)");
            }

            file >> TribeScore::structures;
            file.close();
        } catch (const std::exception& error) {
            Log::GetLog()->error(error.what());
            throw;
        }
    }

    // Get structure points
    int GetStructurePoints(std::string structureName) {
        try {
            const auto& points = TribeScore::structures[structureName];

            if (points > 0) return points;

            return 0;

        } catch (std::exception& error) {
            Log::GetLog()->error(error.what());
            return 0;
        }
    }

    // Send Discord webhook message
    bool sendWebhookMessage(std::string message) {
        try {
            const auto& configuration = TribeScore::config["Config"];

            std::string url = configuration.value("Webhook", "");
            if (url == "") {
                return false;
            }

            const std::string cmd_1 = "curl -i -H \"Accept: application/json\" -H \"Content-Type:application/json\" -X POST --data \"{\\\"content\\\":\\\"";
            const std::string cmd_2 = "\\\"}\" ";
            try {
                system((cmd_1 + message + cmd_2 + url + ">nul 2>nul").c_str());
                return true;
            } catch (std::exception& error) {
                Log::GetLog()->error(error.what());
                return false;
            }
        } catch (std::exception& error) {
            return false;
        }


    }

    // Get tribe name by ide
    std::string getTribeName(int tribeId) {
        FTribeData* result = (FTribeData*)FMemory::Malloc(GetStructSize<FTribeData>());
        RtlSecureZeroMemory(result, GetStructSize<FTribeData>());

        ArkApi::GetApiUtils().GetShooterGameMode()->GetOrLoadTribeData(tribeId, result);

        std::string tribeName = result->TribeNameField().ToString();

        FMemory::Free(result);
        return tribeName;
    }

    // Check if tribes are allianced
    bool isAlliance(int baseTribeId, int tribeIdToCheck) {
        FTribeData* result = (FTribeData*)FMemory::Malloc(GetStructSize<FTribeData>());
        RtlSecureZeroMemory(result, GetStructSize<FTribeData>());
        ArkApi::GetApiUtils().GetShooterGameMode()->GetOrLoadTribeData(baseTribeId, result);

        TArray<FTribeAlliance> alliances = result->TribeAlliancesField();

        bool isAllied = false;

        for (FTribeAlliance ally : alliances) {
            for (const auto tribeId : ally.MembersTribeIDField) {
                if (tribeId == tribeIdToCheck) {
                    isAllied = true;
                    break;
                }
            }
            if (isAllied) break;
        }

        FMemory::Free(result);
        return isAllied;
    }
}
