#pragma once

#include <API/ARK/Ark.h>

class IDatabase
{
public:
	virtual ~IDatabase() = default;

	// Tribescore related
	virtual bool UpdateTribeScore(const std::string attackerTribeId, const std::string defenderTribeId, const std::string points) = 0;
	virtual int GetTribeScore(const std::string tribeId) = 0;

	// Command related
	virtual bool CheckIfSteamIdIsDisabled(const std::string steamId) = 0;
	virtual bool DisableSteamId(const std::string steamId) = 0;
	virtual bool EnableSteamId(const std::string steamId) = 0;

	// Setup
	virtual void Setup() = 0;
};