# Web

These modules enable the integration of advanced web features into your Pong game.

## • Major module: Use a Framework as backend.

In this major module, you are required to utilize a specific web framework for your
backend development, and that framework is Django.

> You can create a backend without using the constraints of this module
> by using the default language/framework. However, this module will
> only be valid if you use the associated constraints.

## • Minor module: Use a front-end framework or toolkit.

Your frontend development will utilize the Bootstrap toolkit.

> You can create a front-end without using the constraints of this
> module by using the default language/framework. However, this module
> will only be valid if you use the associated constraints.

## • Minor module: Use a database for the backend -and more.

The designated database for all DB instances in your project is PostgreSQL.
This choice guarantees data consistency and compatibility across all project 
components and may be a prerequisite for other modules, such as the backend Framework module.

## • Major module: Store the score of a tournament in the Blockchain.

This Major module focuses on implementing a feature within the Pong website to
store tournament scores securely on a blockchain. It is essential to clarify that for
development and testing purposes, we will utilize a testing blockchain environment.
The chosen blockchain for this implementation is Ethereum , and Solidity will be
the programming language used for smart contract development.

◦ Blockchain Integration: The primary goal of this module is to seamlessly 
	integrate blockchain technology, specifically Ethereum , into the Pong website.
	This integration ensures the secure and immutable storage of tournament
	scores, providing players with a transparent and tamper-proof record of their
	gaming achievements.
◦ Solidity Smart Contracts: To interact with the blockchain, we will develop
	Solidity smart contracts. These contracts will be responsible for recording,
	managing, and retrieving tournament scores.
◦ Testing Blockchain: As mentioned earlier, a testing blockchain will be 
	employed for development and testing purposes. This ensures that all blockchain-
	related functionalities are thoroughly validated without any risks associated
	with a live blockchain.
◦ Interoperability: This module may have dependencies on other modules, particularly 
	the Backend Framework module. Integrating blockchain functionality might necessitate 
	adjustments in the backend to accommodate interactions with the blockchain.

By implementing this module, we aim to enhance the Pong website by introducing
a blockchain-based score storage system. Users will benefit from the added layer
of security and transparency, ensuring the integrity of their gaming scores. The
module emphasizes the use of a testing blockchain environment to minimize risks
associated with blockchain development.