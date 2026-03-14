# --- quote.py --- #
#This file is responsible for creating a function that takes anywhere
#from 1 - n tickers and returns a quote using yfinance

import yfinance as yf;

def retrieve_quote(tickers: list[str]):
    """Accepts a list of tickers as input parameter."""

    #Iterate through each ticker. 
    #Check if it's a string.
    #Convert each to a yf Object and data type
    #Process and return quote

    if not tickers:
        return {};

    output = {}; #Initialize an output object to fill

    #Fetch a batch of all tickers at once
    
    if len(tickers) > 1:

        data = yf.download(
            tickers=tickers,
            period="1d",
            group_by="ticker",
            progress=False
        );

        for ticker in tickers:
            
            price = float(data[ticker]['Close'].iloc[-1]);

            output[ticker] = round(price, 2);

    else: #There is only one ticker

        tick = tickers[0]; #Extract the sole ticker

        ytick = yf.Ticker(tick); #Convert to yF ticker

        hist = ytick.history(period="1d");

        quote = round(float(hist.iloc[0]["Close"]));

        print(quote);

        output[tick] = quote;

    return output;




