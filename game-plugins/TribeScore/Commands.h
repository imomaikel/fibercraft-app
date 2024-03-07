#pragma once

#include <fstream>

namespace TribeScore::Commands {
	void Load();
	void Unload();
	
	// Player floating text disable command
	void ErasePlayerSteamIdOnLogout(std::string steamId);
	void DisablePlayerFloatingTextOnLogin(std::string steamId);
	bool IsPlayerFloatingScoreEnabled(std::string steamId);

	// Admin tribe score disable command
	void EraseAdminSteamIdOnLogout(std::string steamId);
	void DisableAdminTribeScoreOnLogin(std::string steamId);
	bool IsAdminTribeScoreEnabled(std::string steamId);
}