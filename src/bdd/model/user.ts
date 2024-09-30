/**
 * Type qui décrit la table User présente dans la base de données.
 */
type User = {
    id: string;
    login: string;
    email: string;
    verifToken: string;
    password: string;
    web_token: string;
    resetToken: string;
    creation_date: Date;
    admin: boolean;
    banned: boolean;
    createdAt: Date;
    last_activity: Date;
    isIncarned?: boolean;
}

export type {
    User
};

