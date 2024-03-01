#pragma once

#include "IDatabase.h"
#include "json.hpp"

namespace TribeScore {
	inline nlohmann::json config;
	inline std::unique_ptr<IDatabase> database;
}