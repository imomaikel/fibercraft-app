#pragma once

#include <API/ARK/Ark.h>

class IDatabase {
public: 
	virtual ~IDatabase() = default;

	//Tribescore related
	virtual bool AddTribescore(std::string tribeid, std::string score) = 0;
	virtual bool UpdateTribescore(std::string tribeId, std::string new_tribescore) = 0;
	
};