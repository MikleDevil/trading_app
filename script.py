import os
from typing import Any, Dict

from dotenv import load_dotenv
from web3 import Web3
from web3.middleware import ExtraDataToPOAMiddleware

load_dotenv()

# Подключение к Binance Smart Chain (BSC)
BSC_RPC_URL: str = "https://bsc-dataseed.binance.org/"
web3: Web3 = Web3(Web3.HTTPProvider(BSC_RPC_URL))

web3.middleware_onion.inject(ExtraDataToPOAMiddleware, layer=0)

if not web3.is_connected():
	print("Ошибка подключения к BSC")
	exit()

print("Подключено к BSC")

WALLET_ADDRESS = "0x62961858E29cd6700182ab2E8faF77CEADBE8Be2"
PRIVATE_KEY: str = os.getenv("PRIVATE_KEY")

PANCAKESWAP_ROUTER_ADDRESS: str = "0x10ED43C718714eb63d5aA57B78B54704E256024E"
BUSD_TOKEN_ADDRESS: str = "0xe9e7cea3dedca5984780bafc599bd69add087d56"  # Адрес токена BUSD
ETH_TOKEN_ADDRESS: str = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8"  # Адрес токена ETH
XRP_TOKEN_ADDRESS: str = "0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE"  # Адрес токена XRP
WBNB_ADDRESS: str = "0xBB4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"  # Wrapped BNB

PANCAKESWAP_ROUTER_ABI = [{
	"inputs": [{
		"internalType": "uint256",
		"name": "amountIn",
		"type": "uint256"
	}, {
		"internalType": "uint256",
		"name": "amountOutMin",
		"type": "uint256"
	}, {
		"internalType": "address[]",
		"name": "path",
		"type": "address[]"
	}, {
		"internalType": "address",
		"name": "to",
		"type": "address"
	}, {
		"internalType": "uint256",
		"name": "deadline",
		"type": "uint256"
	}],
	"name": "swapExactTokensForTokensSupportingFeeOnTransferTokens",
	"outputs": [],
	"stateMutability": "nonpayable",
	"type": "function"
}, {
	"inputs": [{
		"internalType": "uint256",
		"name": "amountOutMin",
		"type": "uint256"
	}, {
		"internalType": "address[]",
		"name": "path",
		"type": "address[]"
	}, {
		"internalType": "address",
		"name": "to",
		"type": "address"
	}, {
		"internalType": "uint256",
		"name": "deadline",
		"type": "uint256"
	}],
	"name": "swapExactETHForTokensSupportingFeeOnTransferTokens",
	"outputs": [],
	"stateMutability": "payable",
	"type": "function"
}]

router_contract = web3.eth.contract(
	address=Web3.to_checksum_address(PANCAKESWAP_ROUTER_ADDRESS),
	abi=PANCAKESWAP_ROUTER_ABI)

token_adresses: Dict[str, str] = {
	'BUSD': BUSD_TOKEN_ADDRESS,
	'ETH': ETH_TOKEN_ADDRESS,
	'XRP': XRP_TOKEN_ADDRESS,
	'BNB': WBNB_ADDRESS
}


# Функция для обмена токенов
def swap_tokens(amount_in: float, from_token_ticket: str, to_token_ticket: str) -> None:
	FROM_TOKEN_ADDRESS: str = token_adresses[from_token_ticket]
	TO_TOKEN_ADDRESS: str = token_adresses[to_token_ticket]

	amount_out_min: int = web3.to_wei(0.000001, 'ether') 
	path: list[str] = [
		Web3.to_checksum_address(FROM_TOKEN_ADDRESS),  # FROM
		Web3.to_checksum_address(TO_TOKEN_ADDRESS)  # TO
	]
	to: str = Web3.to_checksum_address(WALLET_ADDRESS)
	deadline: int = web3.eth.get_block('latest')['timestamp'] + 300

	token_contract = web3.eth.contract(
		address=Web3.to_checksum_address(FROM_TOKEN_ADDRESS),
		abi=[{
			"constant": False,
			"inputs": [{
				"name": "spender",
				"type": "address"
			}, {
				"name": "value",
				"type": "uint256"
			}],
			"name": "approve",
			"outputs": [{
				"name": "",
				"type": "bool"
			}],
			"type": "function"
		}])

	approve_txn = token_contract.functions.approve(
		PANCAKESWAP_ROUTER_ADDRESS,
		web3.to_wei(amount_in, 'ether')).build_transaction({
			'from': WALLET_ADDRESS,
			'gas': 50000,
			'gasPrice': web3.to_wei('1', 'gwei'),
			'nonce': web3.eth.get_transaction_count(WALLET_ADDRESS)
		})

	# Подписание и отправка транзакции одобрения
	signed_approve_txn = web3.eth.account.sign_transaction(
		approve_txn, private_key=PRIVATE_KEY)
	approval_hash: str = web3.eth.send_raw_transaction(
		signed_approve_txn.raw_transaction)
	print(f"Одобрение токенов отправлено. Ожидание подтверждения... hash = {web3.to_hex(approval_hash)}")
	approval_receipt = web3.eth.wait_for_transaction_receipt(
		signed_approve_txn.hash, timeout=300, poll_latency=5)

	if approval_receipt.status == 1:
		print("Одобрение успешно выполнено!")
	else:
		print("Одобрение не удалось!")
		exit(0)

	# Формирование транзакции обмена
	transaction = router_contract.functions.swapExactTokensForTokensSupportingFeeOnTransferTokens(
		web3.to_wei(amount_in, 'ether'), amount_out_min, path, to,
		deadline).build_transaction({
			'from': WALLET_ADDRESS,
			'gas': 200000,
			'gasPrice': web3.to_wei('2', 'gwei'),
			'nonce': web3.eth.get_transaction_count(WALLET_ADDRESS)
		})

	# Подписание транзакции
	signed_txn = web3.eth.account.sign_transaction(transaction, private_key=PRIVATE_KEY)

	# Отправка транзакции
	tx_hash: str = web3.eth.send_raw_transaction(signed_txn.raw_transaction)
	print(f"Транзакция отправлена, hash: {web3.to_hex(tx_hash)}")

	# Проверка статуса транзакции
	tx_receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
	if tx_receipt.status == 1:
		print("Транзакция успешно завершена!")
	else:
		print("Транзакция не удалась!")


import json
import threading
import time

import firebase_admin
import requests
from firebase_admin import (
	credentials,
	db, 
)

service_account_path = "firebase_secret.json"
database_url = os.getenv("FIREBASE_DATABASE_URL")

if not database_url:
	raise ValueError("URL Realtime Database не найден в переменной окружения FIREBASE_DATABASE_URL")

try:
	with open(service_account_path, 'r') as f:
		service_account_info: Dict[str, Any] = json.load(f)
except Exception as e:
	print(f"Ошибка при загрузке файла с ключами: {e}")
	service_account_info = None

if service_account_info:
	try:
		cred = credentials.Certificate(service_account_info)
		firebase_admin.initialize_app(cred, {'databaseURL': database_url})
		print("Firebase успешно инициализирован")
	except ValueError:
		print("Firebase уже инициализирован")
else:
	print("Не удалось инициализировать Firebase")

new_records = list()
tokens_map = dict()


def listen_to_database(reference_path: str) -> None:
	def listener(event: Any) -> None:
		global new_records
		if event.event_type == 'put' or event.event_type == 'patch':
			print(f"Изменение в базе данных: {event.path} => {event.data}")
			new_records.append({"path": event.path, "data": event.data})
			token_ticket: str = event.data.get("token_name")
			if token_ticket == "BNBUSDT": token_ticket = "BUSD"
			elif token_ticket == "BNBETH": token_ticket = "ETH"
			elif token_ticket == "XRPBNB": token_ticket = "XRP"
			tokens_map[token_ticket] = [event.data.get("price"), event.data.get("count"), event.data.get("order_type")]

	ref = db.reference(reference_path)
	ref.listen(listener)

API_URL = "https://api.coingecko.com/api/v3/simple/price?ids=binancecoin,ripple,ethereum&vs_currencies=usd"

bnb_price: float = 0.0
xrp_price: float = 0.0
eth_price: float = 0.0

min_slippage: float = 5.0


def fetch_prices() -> None:
	global bnb_price, xrp_price, eth_price
	try:
		response = requests.get(API_URL)
		response.raise_for_status()
		data: Dict[str, Dict[str, float]] = response.json()

		bnb_price = data.get("binancecoin", {}).get("usd", 0)
		xrp_price = data.get("ripple", {}).get("usd", 0)
		eth_price = data.get("ethereum", {}).get("usd", 0)

		print(f"Обновленные цены: BNB = {bnb_price} USD, XRP = {xrp_price} USD, ETH = {eth_price} USD")

		process_orders()

	except Exception as e:
		print(f"Ошибка при получении данных с CoinGecko: {e}")


def update_prices() -> None:
	while True:
		fetch_prices()
		time.sleep(20)


def process_orders() -> None:
	for x in tokens_map:
		if x is None:
			continue
		print(x, tokens_map[x], float(tokens_map[x][1]))
		if x == "BUSD":
			if bnb_price - min_slippage <= float(tokens_map[x][0]) <= bnb_price + min_slippage:
				print("Ордер сработал", float(tokens_map[x][1]))
				if tokens_map[x][2] == "BUY":
					swap_tokens(float(tokens_map[x][1]), "BNB", x)
				else:
					swap_tokens(float(tokens_map[x][1]), x, "BNB")
				del tokens_map[x]
		elif x == "XRP":
			if xrp_price - min_slippage <= float(tokens_map[x][0]) <= xrp_price + min_slippage:
				print("Ордер сработал")
				if tokens_map[x][2] == "BUY":
					swap_tokens(float(tokens_map[x][1]), "BNB", x)
				else:
					swap_tokens(float(tokens_map[x][1]), x, "BNB")
				del tokens_map[x]
		elif x == "ETH":
			if eth_price - min_slippage <= float(tokens_map[x][0]) <= eth_price + min_slippage:
				print("Ордер сработал")
				if tokens_map[x][2] == "BUY":
					swap_tokens(float(tokens_map[x][1]), "BNB", x)
				else:
					swap_tokens(float(tokens_map[x][1]), x, "BNB")
				del tokens_map[x]


if __name__ == "__main__":
	reference_path: str = "/users"

	listener_thread = threading.Thread(target=listen_to_database,
									   args=(reference_path,))
	listener_thread.daemon = True
	listener_thread.start()

	update_thread = threading.Thread(target=update_prices)
	update_thread.daemon = True
	update_thread.start()

	print(
		f"Отслеживание изменений в ветке базы данных '{reference_path}' запущено. Нажмите Ctrl+C для выхода."
	)

	try:
		while True:
			pass 
	except KeyboardInterrupt:
		print("Программа завершена пользователем.")
