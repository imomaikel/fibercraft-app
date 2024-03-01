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
};