import { Address, toNano } from 'ton-core';
import { JettonWallet } from '../wrappers/JettonWallet';
import { NetworkProvider, sleep } from '@ton-community/blueprint';
import { randomAddress } from '@ton-community/test-utils';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('JettonWallet address'));
    const send_to_address = Address.parse(args.length > 0 ? args[0] : await ui.input('Send to'));

    const jettonWallet = provider.open(JettonWallet.createFromAddress(address));

        await jettonWallet.sendTransfer(provider.sender(), {
            value: toNano('0.2'),
            fwdAmount: toNano('0.05'),
            jettonAmount: toNano('60'),
            toAddress: send_to_address,
            queryId: Date.now()
        });

    ui.write('Transfered successfully!');
}