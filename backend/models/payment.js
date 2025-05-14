module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users', 
        key: 'id',
      },
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Chapa', // Assuming Chapa is the payment gateway
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending', // Can be 'pending', 'completed', 'failed'
    },
    transactionId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    paymentDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    timestamps: true,
  });

  Payment.associate = (models) => {
    Payment.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  };

  return Payment;
};
