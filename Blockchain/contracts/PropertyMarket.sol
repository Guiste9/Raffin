// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./PropertyToken.sol";

contract PropertyMarket is ReentrancyGuard {

    PropertyToken public propertyToken;

    // ─── ESTRUTURAS ────────────────────────────────────────

    struct Booking {
        address guest;
        uint256 checkIn;
        uint256 checkOut;
        uint256 totalPaid;
        bool cancelled;
    }

    struct SaleOffer {
        address seller;
        uint256 shares;
        uint256 pricePerShare;
        bool active;
    }

    // ─── VARIAVEIS ─────────────────────────────────────────

    uint256 public dailyRate;
    uint256 public maintenanceFund;      // fundo de manutenção acumulado

    // Distribuição da diária (em basis points, total = 10000)
    uint256 public cotistasShare = 8500;     // 85%
    uint256 public maintenanceShare = 1000;  // 10%
    uint256 public platformShare = 500;      // 5%
    address public platformWallet;
    address public governanceContract; // endereço do contrato de governança

    // Renda acumulada por cotista (pull pattern)
    mapping(address => uint256) public pendingRent;

    // Snapshot dos cotistas no momento da reserva
    // para distribuição proporcional
    address[] public cotistas;
    mapping(address => bool) public isCotista;

    mapping(uint256 => Booking) public bookings;
    mapping(uint256 => SaleOffer) public saleOffers;
    uint256 public bookingCount;
    uint256 public offerCount;

    // ─── EVENTOS ───────────────────────────────────────────

    event BookingCreated(
        uint256 indexed bookingId,
        address indexed guest,
        uint256 checkIn,
        uint256 checkOut,
        uint256 totalPaid
    );
    event BookingCancelled(uint256 indexed bookingId, address indexed guest);
    event RentClaimed(address indexed cotista, uint256 amount);
    event SaleOfferCreated(
        uint256 indexed offerId,
        address indexed seller,
        uint256 shares,
        uint256 pricePerShare
    );
    event SaleOfferExecuted(
        uint256 indexed offerId,
        address indexed buyer,
        uint256 shares
    );
    event SaleOfferCancelled(uint256 indexed offerId, address indexed seller);
    event DailyRateUpdated(uint256 newRate);
    event MaintenanceFundUsed(uint256 amount, string reason);

    // ─── MODIFIERS ─────────────────────────────────────────

    modifier onlyOwner() {
        require(
            msg.sender == propertyToken.owner() || msg.sender == governanceContract,
            "Sem permissao"
        );
        _;
    }

    modifier onlyCotista() {
        require(
            propertyToken.balanceOf(msg.sender) > 0,
            "Apenas cotistas podem executar"
        );
        _;
    }

    // ─── CONSTRUCTOR ───────────────────────────────────────

    constructor(
        address _propertyToken,
        uint256 _dailyRate,
        address _platformWallet
    ) {
        propertyToken = PropertyToken(_propertyToken);
        dailyRate = _dailyRate;
        platformWallet = _platformWallet;
    }

    // ─── ESTADIAS ──────────────────────────────────────────

    function bookStay(uint256 _checkIn, uint256 _checkOut)
        external
        payable
        nonReentrant
        onlyCotista
    {
        require(_checkIn < _checkOut, "Data invalida");
        require(_checkIn >= block.timestamp, "Check-in no passado");

        uint256 nights = (_checkOut - _checkIn) / 1 days;
        require(nights > 0, "Minimo 1 noite");

        uint256 totalCost = nights * dailyRate;
        require(msg.value == totalCost, "Valor incorreto");
        require(!_hasConflict(_checkIn, _checkOut), "Datas indisponiveis");

        uint256 bookingId = bookingCount++;
        bookings[bookingId] = Booking({
            guest: msg.sender,
            checkIn: _checkIn,
            checkOut: _checkOut,
            totalPaid: msg.value,
            cancelled: false
        });

        _distributeRent(msg.value);

        emit BookingCreated(
            bookingId,
            msg.sender,
            _checkIn,
            _checkOut,
            msg.value
        );
    }

    function cancelBooking(uint256 _bookingId) external nonReentrant {
        Booking storage booking = bookings[_bookingId];
        require(booking.guest == msg.sender, "Nao e o hospede");
        require(!booking.cancelled, "Ja cancelado");
        require(block.timestamp < booking.checkIn, "Check-in ja passou");

        booking.cancelled = true;

        uint256 refund = (booking.totalPaid * 80) / 100;
        (bool success, ) = payable(msg.sender).call{value: refund}("");
        require(success, "Reembolso falhou");

        emit BookingCancelled(_bookingId, msg.sender);
    }

    // ─── RENDA ─────────────────────────────────────────────

    // Cotista saca a renda acumulada (pull pattern)
    function claimRent() external nonReentrant onlyCotista {
        uint256 amount = pendingRent[msg.sender];
        require(amount > 0, "Sem renda para sacar");

        pendingRent[msg.sender] = 0;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Saque falhou");

        emit RentClaimed(msg.sender, amount);
    }

    // Ver renda pendente
    function getPendingRent(address _cotista)
        external
        view
        returns (uint256)
    {
        return pendingRent[_cotista];
    }

    // ─── FUNDO DE MANUTENCAO ───────────────────────────────

    // Dono usa o fundo para cobrir gastos (aprovado pela governança futuramente)
    function useMaintenanceFund(uint256 _amount, string calldata _reason)
        external
        onlyOwner
        nonReentrant
    {
        require(_amount <= maintenanceFund, "Saldo insuficiente no fundo");

        maintenanceFund -= _amount;

        (bool success, ) = payable(msg.sender).call{value: _amount}("");
        require(success, "Transferencia falhou");

        emit MaintenanceFundUsed(_amount, _reason);
    }

    // ─── REVENDA DE COTAS ──────────────────────────────────

    function createSaleOffer(uint256 _shares, uint256 _pricePerShare)
        external
        onlyCotista
    {
        require(_shares > 0, "Shares deve ser maior que 0");
        require(
            propertyToken.balanceOf(msg.sender) >=
                _shares * 10 ** propertyToken.decimals(),
            "Saldo insuficiente"
        );

        uint256 offerId = offerCount++;
        saleOffers[offerId] = SaleOffer({
            seller: msg.sender,
            shares: _shares,
            pricePerShare: _pricePerShare,
            active: true
        });

        emit SaleOfferCreated(offerId, msg.sender, _shares, _pricePerShare);
    }

    function executeSaleOffer(uint256 _offerId)
        external
        payable
        nonReentrant
    {
        SaleOffer storage offer = saleOffers[_offerId];
        require(offer.active, "Oferta inativa");
        require(offer.seller != msg.sender, "Nao pode comprar sua oferta");

        uint256 totalCost = offer.shares * offer.pricePerShare;
        require(msg.value == totalCost, "Valor incorreto");

        offer.active = false;

        // Registra novo cotista se necessário
        if (!isCotista[msg.sender]) {
            cotistas.push(msg.sender);
            isCotista[msg.sender] = true;
        }

        propertyToken.transferFrom(
            offer.seller,
            msg.sender,
            offer.shares * 10 ** propertyToken.decimals()
        );

        (bool success, ) = payable(offer.seller).call{value: msg.value}("");
        require(success, "Pagamento falhou");

        emit SaleOfferExecuted(_offerId, msg.sender, offer.shares);
    }

    function cancelSaleOffer(uint256 _offerId) external {
        SaleOffer storage offer = saleOffers[_offerId];
        require(offer.seller == msg.sender, "Nao e o vendedor");
        require(offer.active, "Oferta ja inativa");

        offer.active = false;

        emit SaleOfferCancelled(_offerId, msg.sender);
    }

    // ─── ADMIN ─────────────────────────────────────────────

    function setDailyRate(uint256 _newRate) external onlyOwner {
        dailyRate = _newRate;
        emit DailyRateUpdated(_newRate);
    }

    function setGovernanceContract(address _governance) external {
    require(
        msg.sender == propertyToken.owner(),
        "Apenas o dono pode executar"
    );
    require(governanceContract == address(0), "Governanca ja definida");
    governanceContract = _governance;
    }

    function registerCotista(address _cotista) external {
        require(
            propertyToken.balanceOf(_cotista) > 0,
            "Nao e cotista"
        );
        if (!isCotista[_cotista]) {
            cotistas.push(_cotista);
            isCotista[_cotista] = true;
        }
    }

    // ─── INTERNAS ──────────────────────────────────────────

    function _distributeRent(uint256 _amount) internal {
        // Fundo de manutenção
        uint256 maintenance = (_amount * maintenanceShare) / 10000;
        maintenanceFund += maintenance;

        // Taxa da plataforma
        uint256 platform = (_amount * platformShare) / 10000;
        (bool success, ) = payable(platformWallet).call{value: platform}("");
        require(success, "Taxa plataforma falhou");

        // Distribui 85% proporcionalmente entre cotistas
        uint256 rentAmount = (_amount * cotistasShare) / 10000;
        uint256 totalSupply = propertyToken.totalSupply();

        for (uint256 i = 0; i < cotistas.length; i++) {
            address cotista = cotistas[i];
            uint256 balance = propertyToken.balanceOf(cotista);
            if (balance > 0) {
                uint256 share = (rentAmount * balance) / totalSupply;
                pendingRent[cotista] += share;
            }
        }
    }

    function _hasConflict(uint256 _checkIn, uint256 _checkOut)
        internal
        view
        returns (bool)
    {
        for (uint256 i = 0; i < bookingCount; i++) {
            Booking memory b = bookings[i];
            if (!b.cancelled) {
                if (_checkIn < b.checkOut && _checkOut > b.checkIn) {
                    return true;
                }
            }
        }
        return false;
    }
}