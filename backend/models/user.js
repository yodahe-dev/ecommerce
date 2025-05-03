module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    bio: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    rating: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    followers: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    following: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    postsCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    verificationCode: {
      type: DataTypes.STRING,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    roleId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Roles',
        key: 'id',
      },
    },
  });

  User.associate = (models) => {
    User.belongsTo(models.Role, {
      foreignKey: 'roleId',
      as: 'role',
    });

    User.hasMany(models.Post, {
      foreignKey: 'userId',
      as: 'userPosts',
    });

    User.belongsToMany(models.TeamBox, {
      through: models.Member,
      as: 'teams',
      foreignKey: 'userId',
      otherKey: 'teamBoxId',
    });

    User.belongsToMany(models.User, {
      through: 'UserFollow',
      as: 'followersList',
      foreignKey: 'followerId',
      otherKey: 'followingId',
    });
  };

  return User;
};
