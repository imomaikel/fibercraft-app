#pragma once

#include <mysql++11.h>
#include <iostream>
#include "IDatabase.h"

#pragma comment(lib, "mysqlclient.lib")


class MySql : public IDatabase {
private:
    daotk::mysql::connection db_;
public:

    explicit MySql(std::string host, std::string username, std::string password, std::string schema) {
        try {
            daotk::mysql::connect_options options;
            options.server = move(host);
            options.username = move(username);
            options.password = move(password);
            options.dbname = move(schema);
            options.autoreconnect = true;
            options.timeout = 30;
            options.port = 3306;


            bool result = db_.open(options);
            if (!result) {
                std::cout << result << std::endl;
                Log::GetLog()->critical("Failed to open database connection!");
            }

            result = db_.query(fmt::format("CREATE TABLE IF NOT EXISTS disabledsteamid (id VARCHAR(32) NOT NULL, PRIMARY KEY (id))"));
            if (!result) {
                Log::GetLog()->critical("Failed to create table disabledsteamid!");
            }

            result = db_.query(fmt::format("CREATE TABLE IF NOT EXISTS tribescore (id BIGINT NOT NULL, score INT NOT NULL DEFAULT 0, PRIMARY KEY (id));"));
            if (!result) {
                Log::GetLog()->critical("Failed to create table tribescore!");
            }

            result = db_.query(fmt::format("CREATE TABLE IF NOT EXISTS adminstribescoredisable (id VARCHAR(32) NOT NULL, PRIMARY KEY (id))"));
            if (!result) {
                Log::GetLog()->critical("Failed to create table disabledsteamid!");
            }

        } catch (const std::exception& exception) {
            Log::GetLog()->critical("Database Error({}, {}): {}", __FILE__, __FUNCTION__, exception.what());
        }
    }

    bool CreateTribeData(const int tribeId) {
        try {
            return db_.query(fmt::format("INSERT IGNORE INTO tribescore (id, score) VALUES ({}, {})", tribeId, 0));
        } catch (const std::exception& exception) {
            Log::GetLog()->critical("Database Error({}, {}): {}", __FILE__, __FUNCTION__, exception.what());
            return false;
        }
    }

    bool UpdateTribeScore(const std::string attackerTribeId, const std::string defenderTribeId, const std::string points) {
        try {
            return db_.query(fmt::format("UPDATE tribescore SET SCORE = CASE WHEN ID = {} THEN SCORE + {} WHEN ID = {} THEN SCORE - {} END WHERE ID IN({} , {})", attackerTribeId, points, defenderTribeId, points, attackerTribeId, defenderTribeId));
        } catch (const std::exception& exception) {
            Log::GetLog()->critical("Database Error({}, {}): {}", __FILE__, __FUNCTION__, exception.what());
            return false;
        }
    }

    bool CheckIfAdminDisabled(const std::string steamId) {
        try {
            std::string id = db_.query(fmt::format("SELECT id FROM adminstribescoredisable WHERE id = {}", steamId)).get_value<std::string>();

            if (id.length() >= 5) return true;
            return false;
   
        } catch (const std::exception& exception) {
            Log::GetLog()->critical("Database Error({}, {}): {}", __FILE__, __FUNCTION__, exception.what());
            return false;
        }
    }

    bool CheckIfSteamIdIsDisabled(const std::string steamId) {
        try {
            std::string id = db_.query(fmt::format("SELECT id FROM disabledsteamid WHERE id = {}", steamId)).get_value<std::string>();

            if (id.length() >= 5) return true;
            return false;

        } catch (const std::exception& exception) {
            Log::GetLog()->critical("Database Error({}, {}): {}", __FILE__, __FUNCTION__, exception.what());
            return false;
        }
    }

    bool DisableAdminSteamId(const std::string steamId) {
        try {
            return db_.query(fmt::format("INSERT INTO adminstribescoredisable (id) VALUES ({})", steamId));
        } catch (const std::exception& exception) {
            Log::GetLog()->critical("Database Error({}, {}): {}", __FILE__, __FUNCTION__, exception.what());
            return false;
        }
    }

    bool DisableSteamId(const std::string steamId) {
        try {
            return db_.query(fmt::format("INSERT INTO disabledsteamid (id) VALUES ({})", steamId));
        } catch (const std::exception& exception) {
            Log::GetLog()->critical("Database Error({}, {}): {}", __FILE__, __FUNCTION__, exception.what());
            return false;
        }
    }

    bool EnableAdminSteamId(const std::string steamId) {
        try {
            return db_.query(fmt::format("DELETE FROM adminstribescoredisable WHERE id = {}", steamId));
        } catch (const std::exception& exception) {
            Log::GetLog()->critical("Database Error({}, {}): {}", __FILE__, __FUNCTION__, exception.what());
            return false;
        }
    }

    bool EnableSteamId(const std::string steamId) {
        try {
            return db_.query(fmt::format("DELETE FROM disabledsteamid WHERE id = {}", steamId));
        } catch (const std::exception& exception) {
            Log::GetLog()->critical("Database Error({}, {}): {}", __FILE__, __FUNCTION__, exception.what());
            return false;
        }
    }

    int GetTribeScore(const std::string tribeId) {
        try {
            int score = db_.query(fmt::format("SELECT score FROM tribescore WHERE id = {}", tribeId)).get_value<int>();
            return score;
        } catch (const std::exception& exception) {
            Log::GetLog()->critical("Database Error({}, {}): {}", __FILE__, __FUNCTION__, exception.what());
            return false;
        }

    }
};