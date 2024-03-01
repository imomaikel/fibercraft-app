#pragma once

#include <API/ARK/Ark.h>

class IDatabase {
public: 
	virtual ~IDatabase() = default;

	//Tribescore related
	virtual bool AddTribescore(std::string tribeid, std::string score) = 0;
	virtual bool UpdateTribescore(std::string tribeId, std::string new_tribescore) = 0;
	virtual bool IsAlreadyInDatabase(std::string tribe_id) = 0;
	virtual int tribescore_amount(std::string tribe_id) = 0;

	//command related
	virtual bool DisabledTribescore(std::string id) = 0;
};