#pragma once

#include <API/ARK/Ark.h>

class IDatabase {
public: 
	virtual ~IDatabase() = default;

	//Tribescore related
	virtual bool AddTribeScore(std::string tribeId, const std::string points) = 0;
	virtual bool RemoveTribeScore(std::string tribeId, const std::string points) = 0;
	virtual int tribescore_amount(std::string tribe_id) = 0;

	//Command related
	virtual bool DisabledTribescore(std::string id) = 0;
	virtual bool AddDisableTribescore(std::string id) = 0;
	virtual bool DeleteFromDisabledTribescoreDatabase(std::string id) = 0;

	//Setup
	virtual bool Setup() = 0;
};