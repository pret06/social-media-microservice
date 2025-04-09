const amqp = require('amqplib')
const logger = require('./logger')

const connection = null
const channel = null    // It is like a creating a session

const EXCHANGE_NAME = 'Social_media_app'

const connectToRabbitMq = async() =>{
    logger.info('Connection to RabbitMq established !')
    try {
        connection = await amqp.connect(process.env.RABBITMQ_URL)
        channel = await connection.createChannel()

        await channel.assertExchange(EXCHANGE_NAME, "topic" , { durable : false })
        logger.info('Connected to Rabbit Mq server !')
        return channel
    } catch (error) {
        logger.error('Some error occured' , error)
    }
}

const publishEvent = async(routingKey, message) => {  
   // In RabbitMQ, the routingKey helps decide: “Who should receive this message?”   It's like a label or topic for the message. If you're sending this:r outingKey = "post.deleted"
    logger.info('Event emit triggered')
    try {
        if(!channel){                        //channel is your RabbitMQ communication tunnel.
            await connectToRabbitMq()
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

const consumeEvent = async(routingKey ,callback)=>{
    logger.info('Listening to Events triggered')
    try {
        if(!channel){
            await connectToRabbitMq()
        }
        const listners = await channel.assertQueue("", {exclusive : true})
        await channel.bindQueue(listners.queue , EXCHANGE_NAME , routingKey)
        channel.consume(listners.queue , (mssg) =>{
            if(mssg !== null){
                const content = JSON.parse(mssg.content.toString())
                callback(content)
                channel.ack(mssg)
            }
            logger.info(`Subscribed to event: ${routingKey}`);
        })
    } catch (error) {
        logger.error('Something went wrong')
        return res.status(500).json({
            success : false,
            message : 'Not able to connect to Rabbit MQ!'
        })
    }
}


module.exports = { connectToRabbitMq , publishEvent ,consumeEvent }

