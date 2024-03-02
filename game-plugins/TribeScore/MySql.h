#pragma once

#include <mysql_error.h>
#include <mysql_driver.h>
#include <mysql_connection.h>
#include <cppconn/prepared_statement.h>

#include "IDatabase.h"



class MySql : public IDatabase {
private:
	sql::Driver* driver;
	sql::Statement* stmt;
	sql::Connection* conn;
	sql::PreparedStatement* res;
    sql::ResultSet* result;
    sql::SQLException* err;
public:
	
	explicit MySql(std::string hostWithPort, std::string username, std::string password, std::string schema) {
		try {
			
			driver = get_driver_instance();
			conn = driver->connect(hostWithPort, username, password);
			conn->setSchema(schema);
		} catch (const std::exception &exception) {
			Log::GetLog()->critical("Database Error({}, {}): {}", __FILE__, __FUNCTION__, exception.what());
		}
	}

    bool AddTribeScore(std::string tribeId, const std::string points) {
        try {
            res = conn->prepareStatement("INSERT INTO score (TribeID, Score) VALUES (?, ?) ON DUPLICATE KEY UPDATE score = score + ?");
           
            res->setBigInt(1, tribeId);
            res->setBigInt(2, points);
            res->setBigInt(3, points);

            res->executeUpdate();
           
            delete res;
            
            return true;
        } catch (const std::exception& exception) {
            Log::GetLog()->critical("Database Error({}, {}): {}", __FILE__, __FUNCTION__, exception.what());
            return false;
        }
    }

    bool RemoveTribeScore(std::string tribeId, const std::string points) {
        try {
            res = conn->prepareStatement("INSERT INTO score (TribeID, Score) VALUES (?, ?) ON DUPLICATE KEY UPDATE score = score - ?");

            res->setBigInt(1, tribeId);
            res->setBigInt(2, points);
            res->setBigInt(3, points);

            res->executeUpdate();

            delete res;

            return true;
        } catch (const std::exception& exception) {
            Log::GetLog()->critical("Database Error({}, {}): {}", __FILE__, __FUNCTION__, exception.what());
            return false;
        }
    }


	bool IsAlreadyInDatabase(std::string tribe_id) {
    try {
        res = conn->prepareStatement("SELECT * FROM score WHERE TribeID = " + tribe_id);
        result = res->executeQuery();
        while (result->next()) {
            try {
                int score = result->getInt("Score");
                if (score != 0) {
									  delete res;
                    return true;
                } else {
									  delete res;
                    return false;
                }
            } catch (std::exception& e) {
                std::cout << "Error MySQL: " << e.what() << std::endl;
								delete res;
                return false;
            }
        }
        
    } catch (const std::exception& exception) {
				delete res;
        return false;
    } 
	}

	int tribescore_amount(std::string tribe_id) {
    try {
        res = conn->prepareStatement("SELECT * FROM score WHERE TribeID = " + tribe_id);

        result = res->executeQuery();
        while (result->next()) {
            return result->getInt("Score");
        }
        delete res;
    } catch (const std::exception& exception) {
        return 0;
    }
    
	}

	bool DisabledTribescore(std::string id) {
    try{
        res = conn->prepareStatement("SELECT * FROM disabledscore WHERE SteamID = " + id);
        result = res->executeQuery();
        while (result->next()) {
            try {
                std::string steamID = result->getString("SteamID");
                std::cout << steamID << " - " << id << std::endl;
                if (steamID == id) {
                    return true;
                } else {
                    return false;
                }
            } catch (const std::exception& exception) {
                std::cout << exception.what() << std::endl;
                return false;
            }
        }
        delete res;
        return false;
    } catch (const std::exception& exception) {
        return false;
    }    
	}

	bool AddDisableTribescore(std::string id) {
    try {
        res = conn->prepareStatement("INSERT INTO disabledscore (SteamID) VALUES (?)");
        res->setBigInt(1, id);
        res->executeUpdate();
        delete res;
				return true;
    } catch (const std::exception& exception) {
        std::cout << exception.what() << std::endl;
				return false;
    }
    
	}
	
	bool DeleteFromDisabledTribescoreDatabase(std::string id) {
    try {
        res = conn->prepareStatement("DELETE FROM disabledscore WHERE SteamID = ?");
        res->setBigInt(1, id);

        res->executeUpdate();
        delete res;
				return true;
    } catch (const std::exception& exception) {
        std::cout << exception.what() << std::endl;
				return false;
    } 
	}

	bool Setup() {
    
    try {
        res = conn->prepareStatement("CREATE TABLE IF NOT EXISTS score (TribeID BIGINT(255),Score BIGINT(255));");

        res->executeUpdate();
        delete res;

        res = conn->prepareStatement("CREATE TABLE IF NOT EXISTS disabledscore (SteamID BIGINT(255)); ");
        res->executeUpdate();
        delete res;

        return true;
    } catch(std::exception &e){
        std::cout << e.what() << std::endl;
        return false;
    }
	}
};