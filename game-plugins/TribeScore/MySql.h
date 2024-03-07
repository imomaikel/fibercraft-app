#pragma once

#include <mysql++11.h>
#include "IDatabase.h"
#include "Utils.h"

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
                Log::GetLog()->critical("Failed to open database connection!");
            }

            result = db_.query("CREATE TABLE IF NOT EXISTS TribeScorePlayerDisabledId (steamId VARCHAR(32) NOT NULL, PRIMARY KEY (steamId));");
            if (!result) {
                Log::GetLog()->critical("Failed to create table TribeScorePlayerDisabledId!");
            }

            result = db_.query("CREATE TABLE IF NOT EXISTS TribeScore (tribeId BIGINT NOT NULL, tribeName VARCHAR(64) NOT NULL, score INT NOT NULL DEFAULT 0, oldScore INT NOT NULL DEFAULT 0, position ENUM('PROMOTE', 'DEMOTE', 'KEEP') DEFAULT 'PROMOTE', PRIMARY KEY (tribeId));");
            if (!result) {
                Log::GetLog()->critical("Failed to create table TribeScore!");
            }

            result = db_.query("CREATE TABLE IF NOT EXISTS TribeScoreAdminDisabledId (steamId VARCHAR(32) NOT NULL, PRIMARY KEY (steamId));");
            if (!result) {
                Log::GetLog()->critical("Failed to create table TribeScoreAdminDisabledId!");
            }

        } catch (const std::exception& exception) {
            Log::GetLog()->critical("Database Error({}, {}): {}", __FILE__, __FUNCTION__, exception.what());
        }
    }


    /* Tribe Score Begin */
    bool UpdateTribeScore(const std::string attackerTribeId, const std::string defenderTribeId, const std::string points) {
        try {
            return db_.query(fmt::format("UPDATE TribeScore SET SCORE = CASE WHEN tribeId = {} THEN SCORE + {} WHEN tribeId = {} THEN SCORE - {} END WHERE tribeId IN ({} , {})", attackerTribeId, points, defenderTribeId, points, attackerTribeId, defenderTribeId));
        } catch (const std::exception& exception) {
            Log::GetLog()->critical("Database Error({}, {}): {}", __FILE__, __FUNCTION__, exception.what());
            return false;
        }
    }
    int GetTribeScore(const std::string tribeId) {
        try {
            int score = db_.query(fmt::format("SELECT score FROM tribescore WHERE steamId = {}", tribeId)).get_value<int>();
            return score;
        } catch (const std::exception& exception) {
            Log::GetLog()->critical("Database Error({}, {}): {}", __FILE__, __FUNCTION__, exception.what());
            return false;
        }
    }
    /* Tribe Score End */


    /* Tribe Data Begin */
    void UpdateTribeName(const int tribeId) {
        try {
            db_.query(fmt::format("UPDATE TribeScore SET tribeName = '{}' WHERE tribeId = {}", TribeScore::Utils::getTribeName(tribeId), tribeId));
        } catch (const std::exception& exception) {
            Log::GetLog()->critical("Database Error({}, {}): {}", __FILE__, __FUNCTION__, exception.what());
        }
    }
    void CreateTribeData(const int tribeId) {
        try {
            db_.query(fmt::format("INSERT IGNORE INTO TribeScore (tribeId, tribeName, score) VALUES ({}, '{}', {})", tribeId, TribeScore::Utils::getTribeName(tribeId), "0"));
        } catch (const std::exception& exception) {
            Log::GetLog()->critical("Database Error({}, {}): {}", __FILE__, __FUNCTION__, exception.what());
        }
    }
    /* Tribe Data End */


    /* Tribe Score Admin Toggle Begin */
    bool IsAdminTribeScoreDisabled(const std::string steamId) {
        try {
            std::string id = db_.query(fmt::format("SELECT steamId FROM TribeScoreAdminDisabledId WHERE steamId = {}", steamId)).get_value<std::string>();

            if (id.length() >= 5) return true;
   
        } catch (const std::exception& exception) {
            Log::GetLog()->critical("Database Error({}, {}): {}", __FILE__, __FUNCTION__, exception.what());
        }
        return false;
    }
    void EnableAdminTribeScore(const std::string steamId) {
        try {
            db_.query(fmt::format("DELETE FROM TribeScoreAdminDisabledId WHERE steamId = {}", steamId));
        } catch (const std::exception& exception) {
            Log::GetLog()->critical("Database Error({}, {}): {}", __FILE__, __FUNCTION__, exception.what());
        }
    }
    void DisableAdminTribeScore(const std::string steamId) {
        try {
            db_.query(fmt::format("INSERT INTO TribeScoreAdminDisabledId (steamId) VALUES ({})", steamId));
        } catch (const std::exception& exception) {
            Log::GetLog()->critical("Database Error({}, {}): {}", __FILE__, __FUNCTION__, exception.what());
        }
    }
    /* Tribe Score Admin Toggle End */


    /* Floating Text Toggle Begin */
    bool IsPlayerFloatingTextDisabled(const std::string steamId) {
        try {
            std::string id = db_.query(fmt::format("SELECT steamId FROM TribeScorePlayerDisabledId WHERE steamId = {}", steamId)).get_value<std::string>();

            if (id.length() >= 5) return true;

        } catch (const std::exception& exception) {
            Log::GetLog()->critical("Database Error({}, {}): {}", __FILE__, __FUNCTION__, exception.what());
        }
        return false;
    }
    void DisableFloatingText(const std::string steamId) {
        try {
            db_.query(fmt::format("INSERT INTO TribeScorePlayerDisabledId (steamId) VALUES ({})", steamId));
        } catch (const std::exception& exception) {
            Log::GetLog()->critical("Database Error({}, {}): {}", __FILE__, __FUNCTION__, exception.what());
        }
    }
    void EnableFloatingText(const std::string steamId) {
        try {
            db_.query(fmt::format("DELETE FROM TribeScorePlayerDisabledId WHERE steamId = {}", steamId));
        } catch (const std::exception& exception) {
            Log::GetLog()->critical("Database Error({}, {}): {}", __FILE__, __FUNCTION__, exception.what());
        }
    }
    /* Floating Text Toggle End */
};