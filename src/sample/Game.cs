using System;
using System.Collections.Generic;
using System.Linq;

namespace TwentyOne
{
  class Game
  {
    private List<Player> _players;
    private Dealer _dealer;
    private Deck _deck;
    private List<Card> _trashpile;

    /// <summary>
    /// Sets up a self-playing round of 21.
    /// </summary>
    /// <param name="numPlayers">The number of players in the round.</param>
    /// <param name="playerLimit">At what score a player will no longer ask for new cards.</param>
    /// <param name="dealerLimit">At what score a dealer will no longer ask for new cards.</param>
    /// <param name="randomizeLimit">Should the limit be randomized?</param>
    /// <param name="randomizeBound">How large should the span of randomization be?</param>
    public Game(int numPlayers = 1, int playerLimit = 15, int dealerLimit = 15, bool randomizeLimit = false, int randomizeBound = 0)
    {
      this._dealer = new Dealer(dealerLimit, randomizeLimit, randomizeBound);
      this._deck = new Deck();
      this._trashpile = new List<Card>();
      this._players = new List<Player>();

      for (int i = 0; i < numPlayers; i++)
      {
        this._players.Add(new Player(i, playerLimit, randomizeLimit, randomizeBound));
      }
    }

    /// <summary>
    /// Adds the trashpile back into the deck and shuffling it.
    /// </summary>
    private void RefillDeck()
    {
      this._deck.AddCardsShuffle(this._trashpile);
      this._trashpile = new List<Card>();
    }

    /// <summary>
    /// Deals a card from the deck to a player.
    /// </summary>
    /// <param name="player">The played to be dealt.</param>
    private void DealCard(Player player)
    {
      if (this._deck.length == 1)
      {
        RefillDeck();
      }

      try
      {
        Card card = this._deck.Deal();
        player.Add(card);
      }
      catch (ArgumentOutOfRangeException e)
      {
        Console.WriteLine($"\nAn error was encountered when dealing cards:\n\nDeck: {e.Message}\n");
        Console.WriteLine($"This was probably caused by having too many players, current amount: {this._players.Count} (42 is the safe maximum)");
        Console.WriteLine("There are not enough cards in a deck to give everyone an initial hand.\nExiting..");
        Environment.Exit(0);
      }
    }

    /// <summary>
    /// Discards a both the player's and dealer's hand.
    /// </summary>
    /// <param name="player">The player to discard cards from.</param>
    /// <returns>A list of discarded cards.</returns>
    private List<Card> DiscardCards(Player player)
    {
      List<Card> discarded = player.cards.Concat(this._dealer.cards).ToList();
      player.Reset();
      this._dealer.Reset();

      return discarded;
    }

    /// <summary>
    /// A function that checks if a player or dealer has won/lost the game outright.
    /// </summary>
    /// <param name="playerX">The player to check against.</param>
    /// <param name="playerY">The opponent.</param>
    /// <returns>True or false depending on if the game is over or not.</returns>
    private bool InstantWinCheck(Player playerX, Player playerY)
    {
      if (playerX.score == 21 || (playerX.cards.Count >= 5 && playerX.score <= 21))
      {
        Console.WriteLine($"{playerX.Report()} WINNER!");
        Console.WriteLine($"{playerY.Report()}");
        Console.WriteLine($"{playerX.name} wins!\n");
        return true;
      }
      else if (playerX.score > 21)
      {
        Console.WriteLine($"{playerX.Report()} BUSTED!");
        Console.WriteLine($"{playerY.Report()}");
        Console.WriteLine($"{playerY.name} wins!\n");
        return true;
      }
      else
      {
        return false;
      }
    }

    /// <summary>
    /// Compares the players score with the dealers to see who has won (if both have stopped drawing cards).
    /// </summary>
    /// <param name="player">The player.</param>
    private void CompareScores(Player player)
    {
      Console.WriteLine($"{player.Report()}");
      Console.WriteLine($"{this._dealer.Report()}");

      if (player.score > this._dealer.score)
      {
        Console.WriteLine($"{player.name} wins!\n");
      }
      else
      {
        Console.WriteLine($"{this._dealer.name} wins!\n");
      }
    }

    /// <summary>
    /// The main game loop.
    /// Draws a card for each player in the round, then each player plays against the dealer.
    /// </summary>
    public void Start()
    {
      this._players.ForEach(player => DealCard(player));

      this._players.ForEach(player =>
      {
        while (player.cards.Count < 2 || player.score <= player.limit)
        {
          DealCard(player);
        }

        if (!InstantWinCheck(player, this._dealer))
        {
          while (this._dealer.cards.Count < 2 || this._dealer.score <= this._dealer.limit)
          {
            DealCard(this._dealer);
          }

          if (!InstantWinCheck(this._dealer, player))
          {
            CompareScores(player);
          }
        }

        this._trashpile = this._trashpile.Concat(DiscardCards(player)).ToList();
      });
    }
  }
}