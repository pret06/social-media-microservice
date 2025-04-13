const ampqlib = require('amqplib')
const logger = require('./logger')

const connection = null
const channel = null

const EXCHANGE_NAME = 'Social-media-events'

async function connectionToRabbitMQ() {
    try {
        connection = await ampqlib.connect(process.env.RABITMQ_URL)
        channel = await connection.createChannel()

        await channel.assertExchange(EXCHANGE_NAME , "topic", { durable : false})
        logger.info('connected to the Rabitmq server!')
    } catch (error) {
        logger.error('Some error occured' , error)
    }
}

async function publishEvent(routingKey , message) {
    try {
        if(!channel){
            await connectionToRabbitMQ()
        }

        channel.publish(
            EXCHANGE_NAME,
            routingKey,
            Buffer.from(JSON.stringify(message))
        )
        
    } catch (error) {
        logger.error('Something went wrong')
        return res.status(500).json({
            success : false,
            message : 'Not able to connect to Rabbit MQ!'
        })
    }
}


module.exports = { connectionToRabbitMQ , publishEvent}