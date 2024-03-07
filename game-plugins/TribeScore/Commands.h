#pragma once

#include <fstream>

namespace TribeScore::Commands {
	void Load();
	void Unload();
	void DisableOnLogin(std::string steamId);
	void EraseOnLogout(std::string steamId);
	bool isSteamDisabled(std::string steamId);
	void AdminEraseOnLogout(std::string steamId);
	void AdminDisableOnLogin(std::string steamId);
	bool isAdminSteamDisabled(std::string steamId);
}