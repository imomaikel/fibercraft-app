#pragma once

#include <fstream>

namespace TribeScore::Commands {
	void Load();
	void Unload();
	void DisableOnLogin(std::string steamId);
	void EraseOnLogout(std::string steamId);
	bool isSteamDisabled(std::string steamId);
}