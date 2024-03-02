#pragma once
#include <iostream>

namespace TribeScore::Utils {
	void ReadConfig();
	void ReadStructures();

	int GetStructurePoints(std::string structureName);
}