#pragma once

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

	bool AddTribescore(std::string tribeid, std::string score) {
		try {
			res = conn->prepareStatement("INSERT INTO score (TribeID, Score) VALUES (?, ?)");
			res->setBigInt(1, tribeid);
			res->setBigInt(2, score);

			res->executeUpdate();
			delete res;
			return true;
		} catch (std::exception& e) {
			std::cout << e.what() << std::endl;
			return false;
		}

	}

	bool UpdateTribescore(std::string tribeId, std::string new_tribescore) {
		try {
			res = conn->prepareStatement("UPDATE score SET Score = ? WHERE TribeID = ?");

			res->setBigInt(1, new_tribescore);
			res->setBigInt(2, tribeId);

			res->executeUpdate();
			delete res;
			return true;
		} catch (std::exception& e) {
			std::cout << e.what() << std::endl;
			return false;
		}

	}

	bool IsAlreadyInDatabase(std::string tribe_id) {
    try {
        conn->setSchema("sys");
        res = conn->prepareStatement("SELECT * FROM score WHERE TribeID = " + tribe_id);
        ResultSet* result = res->executeQuery();
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
        
    } catch (SQLException& e) {
				delete res;
        return false;
    } 
}
};