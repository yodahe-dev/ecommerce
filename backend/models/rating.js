// models/rating.js
module.exports = (sequelize, DataTypes) => {
  const Rating = sequelize.define('Rating', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 10,
      },
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    userId: {
      // rater (always a User)
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    rateableId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    rateableType: {
      type: DataTypes.ENUM('User', 'TeamBox'),
      allowNull: false,
    },
  });

  Rating.associate = (models) => {
    // Rater
    Rating.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'rater',
    });

    // Optional helper for polymorphic target (manual logic needed)
    models.User.hasMany(Rating, {
      foreignKey: 'rateableId',
      constraints: false,
      scope: {
        rateableType: 'User',
      },
      as: 'receivedRatings',
    });

    models.TeamBox.hasMany(Rating, {
      foreignKey: 'rateableId',
      constraints: false,
      scope: {
        rateableType: 'TeamBox',
      },
      as: 'receivedRatings',
    });
  };

  return Rating;
};