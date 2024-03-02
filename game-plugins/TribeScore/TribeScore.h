#pragma once

#include "IDatabase.h"
#include "json.hpp"

namespace TribeScore {
	inline nlohmann::json config;
	inline nlohmann::json structures;
	inline std::unique_ptr<IDatabase> database;
}