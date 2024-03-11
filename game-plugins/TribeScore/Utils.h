#pragma once
#include <iostream>

namespace TribeScore::Utils {
	void ReadConfig();
	void ReadStructures();

	int GetStructurePoints(std::string structureName);

	bool sendWebhookMessage(std::string message);
	bool isAlliance(int baseTribeId, int tribeIdToCheck);

	std::string getTribeName(int tribeId);
}