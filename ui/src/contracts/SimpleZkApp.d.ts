import { State, PublicKey, Field, SmartContract } from 'o1js';
declare class SimpleZkApp extends SmartContract {
    value: State<PublicKey>;
    giveAnswer(answer: Field, value: PublicKey): void;
}
export { SimpleZkApp };
