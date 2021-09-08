## Intro

Curio is a wrapping contract that was broken for a client.

I have reverse engineered the application and re-written the whole code base in order to do debugging for them.

The core issue here is that on initialization the wrapped tokens are Locked, and there is no contract to unlock them.
