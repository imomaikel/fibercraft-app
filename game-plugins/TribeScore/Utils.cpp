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
}