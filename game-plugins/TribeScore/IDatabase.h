#pragma once

#include <API/ARK/Ark.h>

class IDatabase
{
public:
	virtual ~IDatabase() = default;

	// Tribe score
	virtual bool UpdateTribeScore(const std::string attackerTribeId, const std::string defenderTribeId, const std::string points) = 0;
	virtual int GetTribeScore(const std::string tribeId) = 0;

	// Floating text toggle
	virtual bool IsPlayerFloatingTextDisabled(const std::string steamId) = 0;
	virtual void DisableFloatingText(const std::string steamId) = 0;
	virtual void EnableFloatingText(const std::string steamId) = 0;

	// Change tribe
	virtual void CreateTribeData(const int tribeId) = 0;
	virtual void UpdateTribeName(const int tribeId) = 0;

	// Tribe score toogle
	virtual bool IsAdminTribeScoreDisabled(const std::string steamId) = 0;
	virtual void DisableAdminTribeScore(const std::string steamId) = 0;
	virtual void EnableAdminTribeScore(const std::string steamId) = 0;
};