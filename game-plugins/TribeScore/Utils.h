#pragma once
#include <iostream>

namespace TribeScore::Utils {
	void ReadConfig();
	void ReadStructures();

	int GetStructurePoints(std::string structureName);

	bool sendWebhookMessage(std::string message);

	std::string getTribeName(int tribeId);
}