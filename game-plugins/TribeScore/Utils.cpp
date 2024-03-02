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

    // Get Structure points
    int GetStructureTribescore(std::string structureName) {
    try {
        const std::string config_path = ArkApi::Tools::GetCurrentDir() + "/ArkApi/Plugins/TribeScore/structures.json";
        std::ifstream file(config_path);

        if (!file.is_open()) {
            Log::GetLog()->critical("cannot open `structures.json`!");
            return 0;
        }
        json j;

        file >> j;
        file.close();
        if (j.is_array()) {
            for (const auto& elemento : j) {
                if (elemento.contains("structure") && elemento["structure"] == structureName) {
                    if (elemento.contains("points")) {
                        return elemento["points"];
                    }
                }
            }
        }

        return 0;

    } catch (std::exception& e) {
        std::cout << e.what() << std::endl;
        return 0;
    }
}
}