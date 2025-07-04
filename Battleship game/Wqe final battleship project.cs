using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Net;
using System.Runtime.InteropServices;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace Battleship
{
    class Program

    {
        static int Myrow;
        static int Mycolumn;
        static int guessRow;
        static int guessColumn;
        static int row;
        static int column;
        static int Nrow;
        static int Ncolumn;
        static int Erow;
        static int Ecolumn;
        static int randomEcoord;
        static int CPUrow;
        static int CPUcolumn;
        static bool CPUwin = false;
        static int CPUcounter = 0;
        static int Usercounter = 0;
        
        public static void Main(string[] args)
        {
            char[,] Board = new char[10, 10];
            char[,] Eboard = new char[10, 10];
            
            PlaceShip(Board);
            Myship(Board);
            PlaceEShip(Board);



            GuessPlace(Board , Board);
            Console.ReadLine();
        }
        public static void ComputerGuess(char[,] Board)
        {
            Console.WriteLine("Computer wil guess your ship coordinate");

            Random randomnumber = new Random();
            CPUrow = GetRandomCoord(randomnumber);
            CPUcolumn = GetRandomCoord(randomnumber);
            Console.WriteLine(CPUrow + " " + CPUcolumn);
            Board[CPUrow, CPUcolumn] = 'x';
            if (CPUrow == Myrow && CPUcolumn == Myrow)
            {
                Console.WriteLine("Computer wins");
                CPUwin = true;
                CPUcounter = CPUcounter + 1;
            }
            Console.WriteLine("Computer destroyed ships = " + CPUcounter);


        }
        private static void PlaceShip(char[,] Board)
        {
            Random randomnumber = new Random();


            for (int x = 0; x < 10; x++)
            {
                for (int y = 0; y < 10; y++)
                {
                    Board[x, y] = '-';
                }
            }
            for (int i = 0; i < 6; i++)
            {
                row = GetRandomCoord(randomnumber);
                column = GetRandomCoord(randomnumber);
                Board[row, column] = 'T';
                
            }
        }
        public static void PlaceEShip(char[,] EBoard)
        {
            Random randomnumber = new Random();


            for (int x = 0; x < 10; x++)
            {
                for (int y = 0; y < 10; y++)
                {
                    EBoard[x, y] = '-';
                }
            }
            
        }
        public static void EnemyBoard(char[,] EBoard)
        {
            Console.WriteLine();
            Console.WriteLine("The enemy board looks like this");
            Console.WriteLine();
            Console.Write(" ");
            EBoard[guessRow, guessColumn] = 'X';
            for (Ecolumn = 0; Ecolumn < 10; Ecolumn++)
            {
                Console.Write(" " + Ecolumn + "");
            }
            Console.WriteLine();
            for (Erow = 0; Erow < 10; Erow++)
            {
                Console.Write(Erow + " ");
                for (Ecolumn = 0; Ecolumn < 10; Ecolumn++)
                {
                    if (EBoard[Erow, Ecolumn] == 'E')
                    {
                        Console.Write("-");
                        Console.Write("|");
                    }
                    else
                    {
                        Console.Write(EBoard[Erow, Ecolumn]);
                        Console.Write("|");
                    }

                }
                Console.WriteLine();
            }
        }
        static void GuessPlace(char[,] EBoard, char[,] Board)
        {
            bool winner = false;
            do
            {
                Console.WriteLine("Please guess the row of the hiddent treasure");
                guessRow = int.Parse(Console.ReadLine());
                Console.WriteLine("Please guess the Column of the hiddent treasure");
                guessColumn = int.Parse(Console.ReadLine());
                EnemyBoard(EBoard);
                if (guessRow == row && guessColumn == column)
                {
                    winner = true;
                    Console.WriteLine("You win");
                    Usercounter = Usercounter + 1;
                    
                }
                ComputerGuess(Board);
                OutputBoard(Board);
                Console.WriteLine("User destroyed ships" + Usercounter);

            } while (winner == false);
        }

        private static int GetRandomCoord(Random randomnumber)
        {
            int randomcoord;

            randomcoord = randomnumber.Next(0, 10);
            return randomcoord;
        }

        public static void OutputBoard(char[,] Board)
        {
            Console.WriteLine();
            Console.WriteLine("The board looks like this");
            Console.WriteLine();
            Console.Write(" ");
            Board[Myrow, Mycolumn] = 'S';
            for (Ncolumn = 0; Ncolumn < 10; Ncolumn++)
            {
                Console.Write(" " + Ncolumn + "");
            }
            Console.WriteLine();
            for (Nrow = 0; Nrow < 10; Nrow++)
            {
                Console.Write(Nrow + " ");
                for (Ncolumn = 0; Ncolumn < 10; Ncolumn++)
                {
                    if (Board[Nrow, Ncolumn] == 'T')
                    {
                        Console.Write("-");
                        Console.Write("|");
                    }
                    else
                    {
                        Console.Write(Board[Nrow, Ncolumn]);
                        Console.Write("|");
                    }

                }
                Console.WriteLine();
            }


        }
        public static void Myship(char[,] Board)
        {
            int play;
            do
            {

                Console.WriteLine("Please enter 1 to enter a ship or 0 to play the game");
                play = int.Parse(Console.ReadLine());
                Console.WriteLine("Please enter the row of where you would like to place your ship");
                Mycolumn = int.Parse(Console.ReadLine());
                Console.WriteLine("Enter the column");
                Myrow = int.Parse(Console.ReadLine());
                OutputBoard(Board);


            } while (play == 1);






        }
    }
}


