export const newProfile = {
    username: 'bob',
    password: 'my_password'
}
export const newProfileWithPlayer = {
    username: 'john',
    password: 'my_password',
    Player: {
        name: 'John Doe',
        backpackCapacity: 12,
        uniqueIdentifier: 'johnIdentifier',
    }
}
export const metaDataForObject = {
    dataKey: 'Profile',
    modelName: 'Profile',
    dataType: 'Object',
    dataCount: 1
}

export const wrongDataTypes = {
    username: 34,
    password: true
}
export const wrongDataTypesResponse = {
    "statusCode": 400,
    "message": [
        "username must be a string",
        "password must be a string"
    ],
    "error": "Bad Request"
}

export const notUniqueUserName = newProfile;
export const notUniqueUserNameResponse = {
    "statusCode": 409,
    "message": [
        `Field 'username' with value '${notUniqueUserName.username}' already exists`
    ],
    "error": "Conflict"
};

export const wrongDataTypesPlayer = {
    username: 'greg',
    password: 'my_password',
    "Player": {
        "name": 45,
        "backpackCapacity": "67",
        "uniqueIdentifier": false
    }
}
export const wrongDataTypesPlayerResponse = {
    "statusCode": 400,
    "message": [
        "Player.name must be a string",
        "Player.backpackCapacity must be an integer number",
        "Player.uniqueIdentifier must be a string"
    ],
    "error": "Bad Request"
}

export const notUniquePlayerName = {
    username: 'greg',
    password: 'password',
    Player: {
        name: newProfileWithPlayer.Player.name,
        backpackCapacity: 12,
        uniqueIdentifier: 'gregIdentifier',
    }
}
export const notUniquePlayerNameResponse = {
    "statusCode": 409,
    "message": [
        `Field 'name' with value '${notUniquePlayerName.Player.name}' already exists`
    ],
    "error": "Conflict"
}

export const notUniquePlayerUniqueIdentifier = {
    username: 'greg',
    password: 'password',
    Player: {
        name: "Greg",
        backpackCapacity: 12,
        uniqueIdentifier: newProfileWithPlayer.Player.uniqueIdentifier,
    }
}
export const notUniquePlayerUniqueIdentifierResponse = {
    "statusCode": 409,
    "message": [
        `Field 'uniqueIdentifier' with value '${notUniquePlayerUniqueIdentifier.Player.uniqueIdentifier}' already exists`
    ],
    "error": "Conflict"
}