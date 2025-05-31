module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    chapaTxRef: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'initiated',
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'ETB',
    },
    rawResponse: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  });

  Payment.associate = (models) => {
    Payment.hasOne(models.Order, {
      foreignKey: 'paymentId',
      as: 'order',
    });
  };

  return Payment;
};
