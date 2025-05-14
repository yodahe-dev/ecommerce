module.exports = (sequelize, DataTypes) => {
  const Favorite = sequelize.define('Favorite', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users', // Ensure the Users model is properly defined
        key: 'id',
      },
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Products', // Ensure the Products model is properly defined
        key: 'id',
      },
    },
  }, {
    timestamps: true,
  });

  Favorite.associate = (models) => {
    Favorite.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
    Favorite.belongsTo(models.Product, {
      foreignKey: 'productId',
      as: 'product',
    });
  };

  return Favorite;
};
