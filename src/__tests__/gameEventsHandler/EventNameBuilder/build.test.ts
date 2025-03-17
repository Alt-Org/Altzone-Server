import EventNameBuilder from "../../../gameEventsHandler/event/eventNameBuilder";

describe('EventNameBuilder.build() test suite', () => {
    it('Should correctly build an event name for a game win', () => {
        const eventName = EventNameBuilder
            .setResource('game')
            .setAction('winBattle')
            .build();

        expect(eventName).toBe('game.winBattle');
    });

    it('Should correctly build an event name for sending a message', () => {
        const eventName = EventNameBuilder
            .setResource('message')
            .setAction('send')
            .build();

        expect(eventName).toBe('message.send');
    });

    it('Should correctly build an event name for starting a vote', () => {
        const eventName = EventNameBuilder
            .setResource('voting')
            .setAction('start')
            .build();

        expect(eventName).toBe('voting.start');
    });
});
