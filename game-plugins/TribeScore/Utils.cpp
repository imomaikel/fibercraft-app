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
}