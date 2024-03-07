#pragma once
#include <iostream>

namespace TribeScore::Utils {
	void ReadConfig();
	void ReadStructures();

	int GetStructurePoints(std::string structureName);
	bool sendMessage(std::string msg);
	std::string getname(int tribeid);
}