// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./PropertyToken.sol";
import "./PropertyMarket.sol";

contract PropertyGovernance {

    PropertyToken public propertyToken;
    PropertyMarket public propertyMarket;

    // ─── ENUMS ─────────────────────────────────────────────

    enum ProposalType {
        ChangeDailyRate,          // Alterar diária
        UseMaintenanceFund,       // Usar fundo de manutenção
        ChangeCancellationFee,    // Alterar taxa de cancelamento
        PauseSales                // Pausar vendas de cotas
    }

    enum ProposalStatus {
        Active,
        Approved,
        Rejected,
        Executed
    }

    // ─── ESTRUTURAS ────────────────────────────────────────

    struct Proposal {
        uint256 id;
        address proposer;
        ProposalType proposalType;
        ProposalStatus status;
        string description;
        uint256 newValue;       // valor proposto (depende do tipo)
        string reason;          // justificativa (usado em UseMaintenanceFund)
        uint256 votesFor;       // soma dos votos quadráticos favoráveis
        uint256 votesAgainst;   // soma dos votos quadráticos contrários
        uint256 deadline;       // timestamp de encerramento
        bool executed;
    }

    // ─── VARIAVEIS ─────────────────────────────────────────

    uint256 public proposalCount;
    uint256 public constant VOTING_PERIOD = 7 days;
    uint256 public constant QUORUM_PERCENT = 50;    // 50% dos cotistas
    
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    // ─── EVENTOS ───────────────────────────────────────────

    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        ProposalType proposalType,
        string description,
        uint256 newValue,
        uint256 deadline
    );
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        bool support,
        uint256 votingPower
    );
    event ProposalExecuted(uint256 indexed proposalId, ProposalStatus status);

    // ─── MODIFIERS ─────────────────────────────────────────

    modifier onlyCotista() {
        require(
            propertyToken.balanceOf(msg.sender) > 0,
            "Apenas cotistas podem executar"
        );
        _;
    }

    modifier proposalExists(uint256 _proposalId) {
        require(_proposalId < proposalCount, "Proposta nao existe");
        _;
    }

    // ─── CONSTRUCTOR ───────────────────────────────────────

    constructor(address _propertyToken, address _propertyMarket) {
        propertyToken = PropertyToken(_propertyToken);
        propertyMarket = PropertyMarket(_propertyMarket);
    }

    // ─── PROPOSTAS ─────────────────────────────────────────

    function createProposal(
        ProposalType _type,
        string calldata _description,
        uint256 _newValue,
        string calldata _reason
    ) external onlyCotista {
        uint256 proposalId = proposalCount++;

        proposals[proposalId] = Proposal({
            id: proposalId,
            proposer: msg.sender,
            proposalType: _type,
            status: ProposalStatus.Active,
            description: _description,
            newValue: _newValue,
            reason: _reason,
            votesFor: 0,
            votesAgainst: 0,
            deadline: block.timestamp + VOTING_PERIOD,
            executed: false
        });

        emit ProposalCreated(
            proposalId,
            msg.sender,
            _type,
            _description,
            _newValue,
            block.timestamp + VOTING_PERIOD
        );
    }

    // ─── VOTAÇÃO ───────────────────────────────────────────

    function vote(uint256 _proposalId, bool _support)
        external
        onlyCotista
        proposalExists(_proposalId)
    {
        Proposal storage proposal = proposals[_proposalId];

        require(proposal.status == ProposalStatus.Active, "Proposta inativa");
        require(block.timestamp <= proposal.deadline, "Votacao encerrada");
        require(!hasVoted[_proposalId][msg.sender], "Ja votou");

        hasVoted[_proposalId][msg.sender] = true;

        // Voto quadrático — peso = √cotas
        uint256 balance = propertyToken.balanceOf(msg.sender) /
            10 ** propertyToken.decimals();
        uint256 votingPower = _sqrt(balance);

        if (_support) {
            proposal.votesFor += votingPower;
        } else {
            proposal.votesAgainst += votingPower;
        }

        emit VoteCast(_proposalId, msg.sender, _support, votingPower);
    }

    // ─── EXECUÇÃO ──────────────────────────────────────────

    function executeProposal(uint256 _proposalId)
        external
        proposalExists(_proposalId)
    {
        Proposal storage proposal = proposals[_proposalId];

        require(!proposal.executed, "Ja executada");
        require(
            block.timestamp > proposal.deadline,
            "Votacao ainda em andamento"
        );
        require(proposal.status == ProposalStatus.Active, "Proposta inativa");

        proposal.executed = true;

        // Verifica quórum — total de votos deve ser >= 50% do poder total
        uint256 totalVotingPower = _getTotalVotingPower();
        uint256 totalVotesCast = proposal.votesFor + proposal.votesAgainst;
        bool quorumReached = (totalVotesCast * 100) >= (totalVotingPower * QUORUM_PERCENT);

        // Verifica aprovação — maioria simples (50%+1)
        bool approved = quorumReached &&
            (proposal.votesFor > proposal.votesAgainst);

        if (approved) {
            proposal.status = ProposalStatus.Approved;
            _executeAction(proposal);
        } else {
            proposal.status = ProposalStatus.Rejected;
        }

        emit ProposalExecuted(_proposalId, proposal.status);
    }

    // ─── VIEWS ─────────────────────────────────────────────

    function getProposal(uint256 _proposalId)
        external
        view
        proposalExists(_proposalId)
        returns (Proposal memory)
    {
        return proposals[_proposalId];
    }

    function getVotingPower(address _cotista)
        external
        view
        returns (uint256)
    {
        uint256 balance = propertyToken.balanceOf(_cotista) /
            10 ** propertyToken.decimals();
        return _sqrt(balance);
    }

    // ─── INTERNAS ──────────────────────────────────────────

    function _executeAction(Proposal storage proposal) internal {
        if (proposal.proposalType == ProposalType.ChangeDailyRate) {
            propertyMarket.setDailyRate(proposal.newValue);

        } else if (proposal.proposalType == ProposalType.UseMaintenanceFund) {
            propertyMarket.useMaintenanceFund(
                proposal.newValue,
                proposal.reason
            );

        } else if (proposal.proposalType == ProposalType.ChangeCancellationFee) {
            // A ser implementado no PropertyMarket
            // propertyMarket.setCancellationFee(proposal.newValue);

        } else if (proposal.proposalType == ProposalType.PauseSales) {
            // 1 = pausar, 0 = retomar
            propertyToken.setSaleActive(proposal.newValue == 0);
        }
    }

    function _getTotalVotingPower() internal view returns (uint256) {
        uint256 totalSupply = propertyToken.totalSupply() /
            10 ** propertyToken.decimals();
        return _sqrt(totalSupply);
    }

    // Algoritmo de raiz quadrada inteira (Babylonian method)
    function _sqrt(uint256 x) internal pure returns (uint256) {
        if (x == 0) return 0;
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        return y;
    }
}