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
    
    bool UpdateTribeScore(const std::string attackerTribeId, const std::string defenderTribeId, const std::string points) {
        try {
            res = conn->prepareStatement("INSERT INTO tribescore (id, score) VALUES (?, ?) ON DUPLICATE KEY UPDATE score = score + ?;");

            res->setBigInt(1, attackerTribeId);
            res->setBigInt(2, points);
            res->setBigInt(3, points);

            res->executeUpdate();
            

            res = conn->prepareStatement("INSERT INTO tribescore (id, score) VALUES(? , ?) ON DUPLICATE KEY UPDATE score = score - ?;");

            res->setBigInt(1, defenderTribeId);
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
	
    bool CheckIfSteamIdIsDisabled(const std::string steamId) {
        try {
            res = conn->prepareStatement("SELECT * FROM disabledscore WHERE id = " + steamId);
            result = res->executeQuery();
            while (result->next()) {
                try {
                    std::string dbSteamId = result->getString("id");
                    const bool found = dbSteamId == steamId;
                    return found;
                } catch (const std::exception& exception) {
                    Log::GetLog()->critical("Database Error({}, {}): {}", __FILE__, __FUNCTION__, exception.what());
                    return false;
                }
            }
            delete res;
            return false;
        } catch (const std::exception& exception) {
            Log::GetLog()->critical("Database Error({}, {}): {}", __FILE__, __FUNCTION__, exception.what());
            return false;
        }   
	}

	bool DisableSteamId(const std::string steamId) {
        try {
            res = conn->prepareStatement("INSERT INTO disabledsteamid (id) VALUES (?)");
            res->setBigInt(1, steamId);
            res->executeUpdate();
            delete res;
			return true;
        } catch (const std::exception& exception) {
            Log::GetLog()->critical("Database Error({}, {}): {}", __FILE__, __FUNCTION__, exception.what());
            return false;
        }
	}
	
    bool EnableSteamId(const std::string steamId) {
        try {
            res = conn->prepareStatement("DELETE FROM disabledsteamid WHERE id = ?");
            res->setBigInt(1, steamId);

            res->executeUpdate();
            delete res;
			return true;
        } catch (const std::exception& exception) {
            Log::GetLog()->critical("Database Error({}, {}): {}", __FILE__, __FUNCTION__, exception.what());
            return false;
        }
	}
    
    int GetTribeScore(const std::string tribeId) {
        try {
            res = conn->prepareStatement("SELECT * FROM tribescore WHERE id = ?");
            res->setString(1, tribeId);

            result = res->executeQuery();

            while (result->next()) {
                return result->getInt("score");
            }
            delete res;

        } catch (const std::exception& exception) {
            std::cout << exception.what() << std::endl;
            return 0;
        }

    }
	
    void Setup() {
        try {
            res = conn->prepareStatement("CREATE TABLE IF NOT EXISTS disabledsteamid (id VARCHAR(32) NOT NULL, PRIMARY KEY (id))");

            res->executeUpdate();
            delete res;

            res = conn->prepareStatement("CREATE TABLE IF NOT EXISTS tribescore (id BIGINT NOT NULL, score INT NOT NULL DEFAULT 0, PRIMARY KEY (id));");
            res->executeUpdate();
            delete res;

        } catch (const std::exception& exception) {
            Log::GetLog()->critical("Database Error({}, {}): {}", __FILE__, __FUNCTION__, exception.what());
        }
	}
};